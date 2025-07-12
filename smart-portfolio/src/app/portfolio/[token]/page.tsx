// src/app/portfolio/[token]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getMultipleStockPrices } from '@/lib/stock-api'
import PortfolioView from '@/components/PortfolioView'
import ChatInterface from '@/components/ChatInterface'

interface PageProps {
  params: {
    token: string
  }
}

async function getSharedPortfolio(token: string) {
  const sharedAccess = await prisma.sharedPortfolioAccess.findUnique({
    where: { token },
    include: {
      portfolio: {
        include: {
          holdings: true,
          user: {
            select: { name: true }
          }
        }
      }
    }
  })

  if (!sharedAccess || sharedAccess.isRevoked) {
    return null
  }

  if (sharedAccess.expiresAt && new Date() > sharedAccess.expiresAt) {
    return null
  }

  return sharedAccess
}

export default async function SharedPortfolioPage({ params }: PageProps) {
  const sharedAccess = await getSharedPortfolio(params.token)

  if (!sharedAccess) {
    notFound()
  }

  const portfolio = sharedAccess.portfolio

  // Get current stock prices
  const symbols = portfolio.holdings.map((h: { symbol: string }) => h.symbol)
  const stockPrices = await getMultipleStockPrices(symbols)

  // Update holdings with current prices
  const holdingsWithPrices = portfolio.holdings.map((holding: { symbol: string; id: string; createdAt: Date; updatedAt: Date; portfolioId: string; quantity: number; avgPrice: number | null; currentPrice: number | null; sector: string | null }) => {
    const stockData = stockPrices[holding.symbol]
    return {
      ...holding,
      currentPrice: stockData?.price || holding.currentPrice || 0,
      change: stockData?.change || 0,
      changePercent: stockData?.changePercent || 0,
      sector: stockData?.sector || holding.sector || 'Unknown'
    }
  })

  const totalHoldingsValue = holdingsWithPrices.reduce((sum: number, holding: { currentPrice: number; quantity: number }) =>
    sum + (holding.currentPrice * holding.quantity), 0
  )
  
  const totalValue = totalHoldingsValue + portfolio.cash

  const portfolioData = {
    id: portfolio.id,
    name: portfolio.name,
    description: portfolio.description,
    cash: portfolio.cash,
    totalValue,
    totalHoldingsValue,
    owner: portfolio.user.name || 'Anonymous',
    holdings: holdingsWithPrices,
    createdAt: portfolio.createdAt,
    updatedAt: portfolio.updatedAt,
    isShared: true,
    shareToken: params.token
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {portfolio.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Shared by {portfolio.user.name || 'Anonymous'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${totalValue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                Total Portfolio Value
              </div>
            </div>
          </div>
          
          {portfolio.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {portfolio.description}
            </p>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-blue-700 dark:text-blue-300 text-sm">
                This is a shared portfolio. You can view the holdings and AI insights below.
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PortfolioView portfolio={{...portfolioData, description: portfolioData.description || undefined}} />
          </div>
          
          <div className="space-y-6">
            <ChatInterface 
              portfolioId={portfolio.id}
              portfolioName={portfolio.name}
              shareToken={params.token}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const sharedAccess = await getSharedPortfolio(params.token)
  
  if (!sharedAccess) {
    return {
      title: 'Portfolio Not Found'
    }
  }

  const portfolio = sharedAccess.portfolio
  
  return {
    title: `${portfolio.name} | Smart Portfolio`,
    description: `View this shared investment portfolio with AI-powered insights. ${portfolio.description || ''}`,
    openGraph: {
      title: `${portfolio.name} | Smart Portfolio`,
      description: `Investment portfolio shared by ${portfolio.user.name || 'Anonymous'}`,
      type: 'website',
    }
  }
}