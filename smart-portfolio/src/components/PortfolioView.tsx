import React, { useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Eye, EyeOff, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Holding {
  id: string
  symbol: string
  companyName?: string
  quantity: number
  currentPrice: number
  purchasePrice?: number
  change: number
  changePercent: number
  sector: string
  value?: number
}

interface Portfolio {
  id: string
  name: string
  description?: string
  cash: number
  totalValue: number
  totalHoldingsValue: number
  owner: string
  holdings: Holding[]
  createdAt: Date
  updatedAt: Date
  isShared?: boolean
  shareToken?: string
}

interface PortfolioViewProps {
  portfolio: Portfolio
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ portfolio }) => {
  const [viewType, setViewType] = useState<'holdings' | 'sectors'>('holdings')
  const [showValues, setShowValues] = useState(true)

  // Calculate sector allocation
  const sectorData = portfolio.holdings.reduce((acc, holding) => {
    const value = holding.currentPrice * holding.quantity
    acc[holding.sector] = (acc[holding.sector] || 0) + value
    return acc
  }, {} as Record<string, number>)

  const sortedSectors = Object.entries(sectorData)
    .map(([sector, value]) => ({
      sector,
      value,
      percentage: (value / portfolio.totalHoldingsValue) * 100
    }))
    .sort((a, b) => b.value - a.value)

  // Calculate total portfolio performance
  const totalGainLoss = portfolio.holdings.reduce((sum, holding) => {
    const currentValue = holding.currentPrice * holding.quantity
    const purchaseValue = (holding.purchasePrice || holding.currentPrice) * holding.quantity
    return sum + (currentValue - purchaseValue)
  }, 0)

  const totalGainLossPercent = portfolio.holdings.reduce((sum, holding) => {
    const purchasePrice = holding.purchasePrice || holding.currentPrice
    return sum + ((holding.currentPrice - purchasePrice) / purchasePrice) * 100
  }, 0) / portfolio.holdings.length

  const formatCurrency = (amount: number) => {
    return showValues ? `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '***'
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  const getPercentColor = (percent: number) => {
    return percent >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Overview</h2>
          <button
            onClick={() => setShowValues(!showValues)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showValues ? 'Hide' : 'Show'} Values
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(portfolio.totalValue)}
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Holdings Value</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(portfolio.totalHoldingsValue)}
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Cash</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(portfolio.cash)}
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {totalGainLoss >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">Total P&L</span>
            </div>
            <div className={`text-2xl font-bold ${getPercentColor(totalGainLoss)}`}>
              {showValues ? formatCurrency(totalGainLoss) : '***'}
            </div>
            <div className={`text-sm ${getPercentColor(totalGainLossPercent)}`}>
              {formatPercent(totalGainLossPercent)}
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setViewType('holdings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewType === 'holdings'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Holdings
          </button>
          <button
            onClick={() => setViewType('sectors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewType === 'sectors'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Sectors
          </button>
        </div>

        {viewType === 'holdings' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Holdings ({portfolio.holdings.length})
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Symbol</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Quantity</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Change</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Sector</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding, index) => {
                    const holdingValue = holding.currentPrice * holding.quantity
                    const allocation = (holdingValue / portfolio.totalHoldingsValue) * 100
                    
                    return (
                      <tr key={holding.id || index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{holding.symbol}</div>
                            {holding.companyName && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">{holding.companyName}</div>
                            )}
                            <div className="text-xs text-gray-400">{allocation.toFixed(1)}% of portfolio</div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4 text-gray-900 dark:text-white">
                          {holding.quantity.toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-4 text-gray-900 dark:text-white">
                          {formatCurrency(holding.currentPrice)}
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className={`flex items-center justify-end gap-1 ${getPercentColor(holding.changePercent)}`}>
                            {holding.changePercent >= 0 ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                            <div>
                              <div>{formatPercent(holding.changePercent)}</div>
                              <div className="text-xs">{formatCurrency(holding.change)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4 font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(holdingValue)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                            {holding.sector}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sector Allocation
            </h3>
            
            <div className="grid gap-4">
              {sortedSectors.map(({ sector, value, percentage }) => (
                <div key={sector} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{sector}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white min-w-0">
                      {formatCurrency(value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PortfolioView