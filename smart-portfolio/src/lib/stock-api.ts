// src/lib/stock-api.ts
export interface StockData {
    symbol: string
    price: number
    change: number
    changePercent: number
    volume?: number
    marketCap?: number
    sector?: string
  }
  
  // Mock data for demonstration - replace with real API calls
  const MOCK_STOCK_DATA: Record<string, StockData> = {
    'AAPL': {
      symbol: 'AAPL',
      price: 185.64,
      change: 2.34,
      changePercent: 1.28,
      volume: 45231000,
      marketCap: 2800000000000,
      sector: 'Technology'
    },
    'GOOGL': {
      symbol: 'GOOGL',
      price: 141.80,
      change: -1.20,
      changePercent: -0.84,
      volume: 28450000,
      marketCap: 1800000000000,
      sector: 'Technology'
    },
    'MSFT': {
      symbol: 'MSFT',
      price: 384.30,
      change: 5.67,
      changePercent: 1.50,
      volume: 22150000,
      marketCap: 2900000000000,
      sector: 'Technology'
    },
    'AMZN': {
      symbol: 'AMZN',
      price: 155.89,
      change: 3.45,
      changePercent: 2.26,
      volume: 35680000,
      marketCap: 1600000000000,
      sector: 'Consumer Discretionary'
    },
    'TSLA': {
      symbol: 'TSLA',
      price: 248.50,
      change: -4.32,
      changePercent: -1.71,
      volume: 89450000,
      marketCap: 850000000000,
      sector: 'Consumer Discretionary'
    },
    'NVDA': {
      symbol: 'NVDA',
      price: 722.48,
      change: 15.67,
      changePercent: 2.22,
      volume: 31250000,
      marketCap: 1800000000000,
      sector: 'Technology'
    },
    'JPM': {
      symbol: 'JPM',
      price: 174.35,
      change: 0.89,
      changePercent: 0.51,
      volume: 8540000,
      marketCap: 520000000000,
      sector: 'Financial Services'
    },
    'JNJ': {
      symbol: 'JNJ',
      price: 162.45,
      change: -0.34,
      changePercent: -0.21,
      volume: 4350000,
      marketCap: 430000000000,
      sector: 'Healthcare'
    },
    'V': {
      symbol: 'V',
      price: 259.77,
      change: 2.15,
      changePercent: 0.84,
      volume: 5680000,
      marketCap: 580000000000,
      sector: 'Financial Services'
    },
    'UNH': {
      symbol: 'UNH',
      price: 524.67,
      change: 4.32,
      changePercent: 0.83,
      volume: 2340000,
      marketCap: 490000000000,
      sector: 'Healthcare'
    }
  }
  
  export async function getStockPrice(symbol: string): Promise<StockData | null> {
    // In production, replace with actual API call
    // Example with TwelveData API:
    /*
    try {
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVEDATA_API_KEY}`
      )
      const data = await response.json()
      return {
        symbol,
        price: parseFloat(data.price),
        change: 0, // Get from another endpoint
        changePercent: 0,
        sector: await getStockSector(symbol)
      }
    } catch (error) {
      console.error('Error fetching stock data:', error)
      return null
    }
    */
  
    // Mock implementation with slight price variation
    const baseData = MOCK_STOCK_DATA[symbol.toUpperCase()]
    if (!baseData) {
      return null
    }
  
    // Add some random variation to simulate real-time data
    const variation = (Math.random() - 0.5) * 0.02 // ±1% variation
    const newPrice = baseData.price * (1 + variation)
    const priceChange = newPrice - baseData.price
    const percentChange = (priceChange / baseData.price) * 100
  
    return {
      ...baseData,
      price: Number(newPrice.toFixed(2)),
      change: Number(priceChange.toFixed(2)),
      changePercent: Number(percentChange.toFixed(2))
    }
  }
  
  export async function getMultipleStockPrices(symbols: string[]): Promise<Record<string, StockData>> {
    const results: Record<string, StockData> = {}
    
    for (const symbol of symbols) {
      const data = await getStockPrice(symbol)
      if (data) {
        results[symbol.toUpperCase()] = data
      }
    }
    
    return results
  }
  
  export async function getStockSector(symbol: string): Promise<string> {
    const data = MOCK_STOCK_DATA[symbol.toUpperCase()]
    return data?.sector || 'Unknown'
  }
  
  // Helper function to add random market movement
  export function simulateMarketMovement(basePrice: number): number {
    const variation = (Math.random() - 0.5) * 0.05 // ±2.5% variation
    return basePrice * (1 + variation)
  }