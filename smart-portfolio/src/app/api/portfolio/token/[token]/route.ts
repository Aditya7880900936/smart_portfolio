// src/app/api/portfolio/token/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMultipleStockPrices } from '@/lib/stock-api'

interface Context {
  params: {
    token: string
  }
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const session = await getServerSession(authOptions)
    
    // Find shared access by token
    const sharedAccess = await prisma.sharedPortfolioAccess.findUnique({
      where: { token: params.token },
      include: {
        portfolio: {
          include: {
            holdings: true,
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    })

    if (!sharedAccess || sharedAccess.isRevoked) {
      return NextResponse.json({ error: 'Invalid or expired share link' }, { status: 404 })
    }

    // Check if link has expired
    if (sharedAccess.expiresAt && new Date() > sharedAccess.expiresAt) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 })
    }

    // Get client IP for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Log the access
    await prisma.tokenAccessLog.create({
      data: {
        tokenId: sharedAccess.id,
        ipAddress: clientIP,
        userAgent: userAgent,
      }
    })

    // Update view count and last viewed
    await prisma.sharedPortfolioAccess.update({
      where: { id: sharedAccess.id },
      data: {
        viewCount: sharedAccess.viewCount + 1,
        lastViewedAt: new Date()
      }
    })

    // If user is logged in, associate access with user
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (user && !sharedAccess.userId) {
        await prisma.sharedPortfolioAccess.update({
          where: { id: sharedAccess.id },
          data: { userId: user.id }
        })
      }
    }

    // Get current stock prices
    const symbols = sharedAccess.portfolio.holdings.map((h: { symbol: string }) => h.symbol)
    const stockPrices = await getMultipleStockPrices(symbols)

    // Update holdings with current prices
    const holdingsWithPrices = sharedAccess.portfolio.holdings.map((holding: { 
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
      return {
        ...holding,
        currentPrice: stockData?.price || holding.currentPrice || 0,
        change: stockData?.change || 0,
        changePercent: stockData?.changePercent || 0,
        sector: stockData?.sector || holding.sector || 'Unknown'
      }
    })

    // Calculate portfolio value
    const totalHoldingsValue = holdingsWithPrices.reduce((sum: number, holding: { currentPrice: number, quantity: number }) =>
      sum + (holding.currentPrice * holding.quantity), 0
    )
    
    const totalValue = totalHoldingsValue + sharedAccess.portfolio.cash

    const portfolioData = {
      id: sharedAccess.portfolio.id,
      name: sharedAccess.portfolio.name,
      description: sharedAccess.portfolio.description,
      cash: sharedAccess.portfolio.cash,
      totalValue,
      totalHoldingsValue,
      owner: sharedAccess.portfolio.user.name || 'Anonymous',
      holdings: holdingsWithPrices,
      createdAt: sharedAccess.portfolio.createdAt,
      updatedAt: sharedAccess.portfolio.updatedAt
    }

    return NextResponse.json(portfolioData)
  } catch (error) {
    console.error('Token access error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const { action } = await request.json()
    
    if (action === 'analytics') {
      const sharedAccess = await prisma.sharedPortfolioAccess.findUnique({
        where: { token: params.token },
        include: {
          accessLogs: {
            select: {
              viewedAt: true,
              ipAddress: true
            },
            orderBy: { viewedAt: 'desc' },
            take: 100
          }
        }
      })

      if (!sharedAccess) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
      }

      const analytics = {
        totalViews: sharedAccess.viewCount,
        uniqueVisitors: new Set(sharedAccess.accessLogs.map((log: { ipAddress: string | null }) => log.ipAddress).filter((ip): ip is string => ip !== null)).size,
        lastViewed: sharedAccess.lastViewedAt,
        recentViews: sharedAccess.accessLogs.slice(0, 10)
      }

      return NextResponse.json(analytics)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Token analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}