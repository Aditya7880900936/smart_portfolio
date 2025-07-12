import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, TrendingUp, DollarSign, PieChart, AlertCircle, Loader2, MessageCircle, Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

interface ChatInterfaceProps {
  portfolioId: string
  portfolioName: string
  shareToken?: string
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ portfolioId, portfolioName, shareToken }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your AI portfolio assistant. I can help you analyze ${portfolioName} and provide insights about your holdings, sector allocation, risk assessment, and market trends. What would you like to know about your portfolio?`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Quick action prompts
  const quickActions = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Performance Analysis",
      prompt: "Analyze the performance of my portfolio and highlight top performers and underperformers"
    },
    {
      icon: <PieChart className="w-4 h-4" />,
      label: "Sector Diversification",
      prompt: "Review my sector allocation and suggest improvements for better diversification"
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: "Risk Assessment",
      prompt: "Assess the risk profile of my portfolio and provide recommendations"
    },
    {
      icon: <AlertCircle className="w-4 h-4" />,
      label: "Market Insights",
      prompt: "What are the current market trends affecting my holdings?"
    }
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response (in real app, this would be an API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleQuickAction = (prompt: string) => {
    setInputMessage(prompt)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Simulate AI responses based on input
  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('performance') || lowerInput.includes('analyze')) {
      return "Based on your portfolio analysis, here are the key insights:\n\n• **Top Performers**: Your technology holdings are showing strong momentum with an average gain of 12.3% this quarter\n• **Underperformers**: Energy sector positions are down 8.2%, potentially due to recent market volatility\n• **Overall Performance**: Your portfolio is outperforming the S&P 500 by 2.1% year-to-date\n\n**Recommendation**: Consider rebalancing by taking some profits from tech stocks and potentially adding defensive positions."
    }
    
    if (lowerInput.includes('sector') || lowerInput.includes('diversification')) {
      return "Your portfolio's sector allocation shows:\n\n• **Technology**: 35% (Overweight)\n• **Healthcare**: 20% (Balanced)\n• **Financial Services**: 15% (Underweight)\n• **Consumer Goods**: 12% (Balanced)\n• **Energy**: 8% (Underweight)\n• **Other**: 10%\n\n**Analysis**: You have a heavy concentration in technology. Consider reducing tech exposure to 25-30% and increasing allocation to defensive sectors like utilities or consumer staples for better risk-adjusted returns."
    }
    
    if (lowerInput.includes('risk') || lowerInput.includes('assessment')) {
      return "**Risk Assessment Summary**:\n\n• **Overall Risk Level**: Medium-High\n• **Beta**: 1.24 (24% more volatile than market)\n• **Sharpe Ratio**: 0.89 (Good risk-adjusted returns)\n• **Maximum Drawdown**: -18.3% (Acceptable)\n\n**Key Risks**:\n- High concentration in growth stocks\n- Limited exposure to defensive sectors\n- Geographic concentration (85% US equities)\n\n**Recommendations**: Add international diversification and consider defensive positions to reduce overall portfolio volatility."
    }
    
    if (lowerInput.includes('market') || lowerInput.includes('trends')) {
      return "**Current Market Trends Affecting Your Holdings**:\n\n• **Fed Policy**: Recent rate decisions are impacting growth stocks in your portfolio\n• **Sector Rotation**: Money is flowing from growth to value, affecting your tech positions\n• **Earnings Season**: 73% of your holdings have upcoming earnings in the next 4 weeks\n• **Geopolitical Factors**: Trade policies may impact your international exposure\n\n**Actionable Insights**: Monitor earnings announcements closely and consider hedging strategies for the next quarter."
    }
    
    return "I'd be happy to help you with portfolio analysis! I can provide insights on:\n\n• Portfolio performance and stock analysis\n• Sector allocation and diversification\n• Risk assessment and recommendations\n• Market trends and their impact on your holdings\n• Rebalancing suggestions\n\nWhat specific aspect of your portfolio would you like to explore?"
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col h-[600px]">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Portfolio Assistant</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get insights about {portfolioName}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {message.content}
              </div>
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Analyzing your portfolio...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.prompt)}
                className="flex items-center gap-2 p-2 text-left text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {action.icon}
                <span className="text-gray-700 dark:text-gray-300">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your portfolio..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface