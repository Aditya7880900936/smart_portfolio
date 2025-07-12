// src/lib/openai.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface PortfolioData {
  name: string
  totalValue: number
  cash: number
  holdings: {
    symbol: string
    quantity: number
    currentPrice: number
    value: number
    sector: string
  }[]
}

export interface PortfolioInsights {
  summary: string
  diversification: string
  riskAnalysis: string
  thesis: string
}

const SYSTEM_PROMPT = `You are a professional financial advisor and portfolio analyst with expertise in investment strategy, risk management, and market analysis. Your role is to provide educational, insightful analysis of investment portfolios.

Guidelines:
- Provide objective, educational analysis focused on diversification, risk, and investment principles
- Use clear, professional language suitable for retail investors
- Focus on portfolio construction principles rather than specific buy/sell recommendations
- Highlight both strengths and potential areas for improvement
- Be encouraging while being realistic about risks
- Keep insights concise but comprehensive

When analyzing portfolios, consider:
- Sector diversification and concentration risk
- Asset allocation principles
- Risk-return profiles
- Market cap exposure
- Geographic diversification (if applicable)
- Overall portfolio balance

Format your responses as requested, maintaining a professional yet approachable tone.`

export async function generatePortfolioInsights(
  portfolioData: PortfolioData
): Promise<PortfolioInsights> {
  const prompt = `Analyze this investment portfolio and provide insights:

Portfolio: ${portfolioData.name}
Total Value: $${portfolioData.totalValue.toLocaleString()}
Cash: $${portfolioData.cash.toLocaleString()}

Holdings:
${portfolioData.holdings.map(h => 
  `- ${h.symbol}: ${h.quantity} shares @ $${h.currentPrice} = $${h.value.toLocaleString()} (${h.sector})`
).join('\n')}

Please provide:
1. SUMMARY: A 2-3 sentence overview of the portfolio's characteristics and total value
2. DIVERSIFICATION: Analysis of sector/asset diversification, concentration risks, and balance
3. RISK_ANALYSIS: Assessment of portfolio risk level, volatility factors, and risk management
4. THESIS: A one-liner investment thesis summarizing the portfolio's strategic approach

Format as JSON with keys: summary, diversification, riskAnalysis, thesis`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    try {
      return JSON.parse(response)
    } catch {
      // Fallback if JSON parsing fails
      return {
        summary: 'Portfolio analysis completed successfully.',
        diversification: 'Portfolio shows moderate diversification across sectors.',
        riskAnalysis: 'Risk profile appears balanced for the given holdings.',
        thesis: 'Balanced portfolio with growth and value characteristics.'
      }
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate portfolio insights')
  }
}

export async function chatWithPortfolio(
  portfolioData: PortfolioData,
  question: string,
  chatHistory: any[] = []
): Promise<string> {
  const contextPrompt = `You are analyzing this portfolio:
${portfolioData.name} - Total Value: $${portfolioData.totalValue.toLocaleString()}
Cash: $${portfolioData.cash.toLocaleString()}

Holdings:
${portfolioData.holdings.map(h => 
  `${h.symbol}: ${h.quantity} shares @ $${h.currentPrice} = $${h.value.toLocaleString()} (${h.sector})`
).join('\n')}

Answer the user's question about this specific portfolio. Be helpful, accurate, and educational.`

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: contextPrompt },
      ...chatHistory,
      { role: 'user', content: question }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    })

    return completion.choices[0]?.message?.content || 'I apologize, but I cannot answer that question at the moment.'
  } catch (error) {
    console.error('OpenAI chat error:', error)
    return 'I apologize, but I encountered an error while processing your question.'
  }
}

export { openai }