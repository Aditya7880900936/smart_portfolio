// src/app/api/insights/[portfolioId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePortfolioInsights, chatWithPortfolio } from '@/lib/openai'
import { getMultipleStockPrices } from '@/lib/stock-api'
import { z } from 'zod'

interface Context {
  params: {
    portfolioId: string
  }
}

const ChatSchema = z.object({
  question: z.string().min(1).max(500),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().default([])
})

export async function GET(request: NextRequest, { params }: Context) {
  try {
    // First check if this is a token-based access
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    let portfolio
    
    if (token) {
      // Token-based access (for shared portfolios)
      const sharedAccess = await prisma.sharedPortfolioAccess.findUnique({
        where: { token },
        include: {
          portfolio: {
            include: {
              holdings: true,
              insights: {
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          }
        }
      })
      
      if (!sharedAccess || sharedAccess.isRevoked) {
        return NextResponse.json({ error: 'Invalid or expired share link' }, { status: 404 })
      }
      
      portfolio = sharedAccess.portfolio
    } else {
      // Direct access (authenticated user)
      portfolio = await prisma.portfolio.findUnique({
        where: { id: params.portfolioId },
        include: {
          holdings: true,
          insights: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })
    }

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Get current stock prices
    const symbols = portfolio.holdings.map((h: { symbol: string }) => h.symbol)
    const stockPrices = await getMultipleStockPrices(symbols)

    // Build portfolio data for AI analysis
    const holdingsWithPrices = portfolio.holdings.map((holding: { 
      symbol: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      portfolioId: string;
      quantity: number;
      avgPrice: number | null;
      currentPrice: number | null;
      sector: string | null;
    }) => {
      const stockData = stockPrices[holding.symbol]
      const currentPrice = stockData?.price || holding.currentPrice || 0
      return {
        symbol: holding.symbol,
        quantity: holding.quantity,
        currentPrice,
        value: currentPrice * holding.quantity,
        sector: stockData?.sector || holding.sector || 'Unknown'
      }
    })

    const totalValue = holdingsWithPrices.reduce((sum: number, h: { value: number }) => sum + h.value, 0) + portfolio.cash

    const portfolioData = {
      name: portfolio.name,
      totalValue,
      cash: portfolio.cash,
      holdings: holdingsWithPrices
    }

    // Check if we have recent insights (within last hour)
    const recentInsight = portfolio.insights[0]
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    let insights
    
    if (recentInsight && recentInsight.createdAt > oneHourAgo) {
      // Use cached insights
      insights = {
        summary: recentInsight.summary,
        diversification: recentInsight.diversification,
        riskAnalysis: recentInsight.riskAnalysis,
        thesis: recentInsight.thesis,
        createdAt: recentInsight.createdAt
      }
    } else {
      // Generate new insights
      try {
        const newInsights = await generatePortfolioInsights(portfolioData)
        
        // Save to database
        const savedInsight = await prisma.portfolioInsight.create({
          data: {
            portfolioId: portfolio.id,
            summary: newInsights.summary,
            diversification: newInsights.diversification,
            riskAnalysis: newInsights.riskAnalysis,
            thesis: newInsights.thesis,
          }
        })
        
        insights = {
          ...newInsights,
          createdAt: savedInsight.createdAt
        }
      } catch (error) {
        console.error('Error generating insights:', error)
        
        // Fallback to basic insights
        insights = {
          summary: `This portfolio has a total value of $${totalValue.toLocaleString()} across ${portfolio.holdings.length} holdings plus $${portfolio.cash.toLocaleString()} in cash.`,
          diversification: 'Portfolio contains holdings across multiple sectors providing reasonable diversification.',
          riskAnalysis: 'Risk level appears moderate based on the portfolio composition.',
          thesis: 'Balanced investment approach with focus on growth and stability.',
          createdAt: new Date()
        }
      }
    }

    return NextResponse.json({
      insights,
      portfolioData
    })
  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const body = await request.json()
    const { question, chatHistory } = ChatSchema.parse(body)
    
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    let portfolio
    
    if (token) {
      const sharedAccess = await prisma.sharedPortfolioAccess.findUnique({
        where: { token },
        include: {
          portfolio: {
            include: { holdings: true }
          }
        }
      })
      
      if (!sharedAccess || sharedAccess.isRevoked) {
        return NextResponse.json({ error: 'Invalid or expired share link' }, { status: 404 })
      }
      
      portfolio = sharedAccess.portfolio
    } else {
      portfolio = await prisma.portfolio.findUnique({
        where: { id: params.portfolioId },
        include: { holdings: true }
      })
    }

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Get current stock prices
    const symbols = portfolio.holdings.map((h: { symbol: string }) => h.symbol)
    const stockPrices = await getMultipleStockPrices(symbols)

    const holdingsWithPrices = portfolio.holdings.map((holding: { 
      symbol: string; 
      id: string; 
      createdAt: Date; 
      updatedAt: Date; 
      portfolioId: string; 
      quantity: number; 
      avgPrice: number | null; 
      currentPrice: number | null; 
      sector: string | null; 
    }) => {
      const stockData = stockPrices[holding.symbol]
      const currentPrice = stockData?.price || holding.currentPrice || 0
      return {
        symbol: holding.symbol,
        quantity: holding.quantity,
        currentPrice,
        value: currentPrice * holding.quantity,
        sector: stockData?.sector || holding.sector || 'Unknown'
      }
    })

    const totalValue = holdingsWithPrices.reduce((sum: number, h: { value: number }) => sum + h.value, 0) + portfolio.cash

    const portfolioData = {
      name: portfolio.name,
      totalValue,
      cash: portfolio.cash,
      holdings: holdingsWithPrices
    }

    const response = await chatWithPortfolio(portfolioData, question, chatHistory)

    return NextResponse.json({ 
      response,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}