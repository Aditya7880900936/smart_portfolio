import React, { useState } from 'react'
import { Plus, X, DollarSign, TrendingUp, Eye, EyeOff, Lock } from 'lucide-react'

interface Holding {
  symbol: string
  quantity: number
  avgPrice: number
}

interface FormData {
  name: string
  description: string
  visibility: 'PRIVATE' | 'PUBLIC' | 'SMART_SHARED'
  cash: number
  holdings: Holding[]
}

interface ValidationErrors {
  [key: string]: string
}

interface SubmitStatus {
  type: 'success' | 'error'
  message: string
}

const PortfolioForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    visibility: 'PRIVATE',
    cash: 0,
    holdings: []
  })
  
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null)

  const visibilityOptions = [
    { value: 'PRIVATE', label: 'Private', icon: Lock, description: 'Only you can see this portfolio' },
    { value: 'PUBLIC', label: 'Public', icon: Eye, description: 'Anyone can view this portfolio' },
    { value: 'SMART_SHARED', label: 'Smart Shared', icon: EyeOff, description: 'Shared with selected people' }
  ]

  const addHolding = (): void => {
    setFormData(prev => ({
      ...prev,
      holdings: [...prev.holdings, { symbol: '', quantity: 0, avgPrice: 0 }]
    }))
  }

  const removeHolding = (index: number): void => {
    setFormData(prev => ({
      ...prev,
      holdings: prev.holdings.filter((_, i) => i !== index)
    }))
  }

  const updateHolding = (index: number, field: keyof Holding, value: string | number): void => {
    setFormData(prev => ({
      ...prev,
      holdings: prev.holdings.map((holding, i) => 
        i === index ? { ...holding, [field]: value } : holding
      )
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Portfolio name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Portfolio name must be 100 characters or less'
    }
    
    if (formData.cash < 0) {
      newErrors.cash = 'Cash amount cannot be negative'
    }
    
    formData.holdings.forEach((holding, index) => {
      if (!holding.symbol.trim()) {
        newErrors[`holding_${index}_symbol`] = 'Symbol is required'
      } else if (holding.symbol.length > 10) {
        newErrors[`holding_${index}_symbol`] = 'Symbol must be 10 characters or less'
      }
      
      if (holding.quantity < 0) {
        newErrors[`holding_${index}_quantity`] = 'Quantity cannot be negative'
      }
      
      if (holding.avgPrice < 0) {
        newErrors[`holding_${index}_avgPrice`] = 'Average price cannot be negative'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus(null)
    
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        const portfolio = await response.json()
        setSubmitStatus({ type: 'success', message: 'Portfolio created successfully!' })
        // Reset form
        setFormData({
          name: '',
          description: '',
          visibility: 'PRIVATE',
          cash: 0,
          holdings: []
        })
      } else {
        const error = await response.json()
        setSubmitStatus({ type: 'error', message: error.error || 'Failed to create portfolio' })
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Create New Portfolio</h1>
                <p className="text-blue-100 mt-2">Build and track your investment portfolio</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Portfolio Details */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Portfolio Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="My Investment Portfolio"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Cash
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.cash}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, cash: parseFloat(e.target.value) || 0 }))}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.cash ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.cash && (
                    <p className="mt-1 text-sm text-red-600">{errors.cash}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Optional description of your portfolio strategy..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Visibility
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {visibilityOptions.map((option) => (
                    <div key={option.value} className="relative">
                      <input
                        type="radio"
                        id={option.value}
                        name="visibility"
                        value={option.value}
                        checked={formData.visibility === option.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'PRIVATE' | 'PUBLIC' | 'SMART_SHARED' }))}
                        className="sr-only"
                      />
                      <label
                        htmlFor={option.value}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.visibility === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <option.icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Holdings */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Holdings
                </h2>
                <button
                  type="button"
                  onClick={addHolding}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Holding</span>
                </button>
              </div>
              
              {formData.holdings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No holdings added yet</p>
                  <p className="text-sm text-gray-400">Click "Add Holding" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.holdings.map((holding, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800">Holding #{index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeHolding(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Symbol *
                          </label>
                          <input
                            type="text"
                            value={holding.symbol}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHolding(index, 'symbol', e.target.value.toUpperCase())}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors[`holding_${index}_symbol`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="AAPL"
                          />
                          {errors[`holding_${index}_symbol`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`holding_${index}_symbol`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={holding.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHolding(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors[`holding_${index}_quantity`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                          {errors[`holding_${index}_quantity`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`holding_${index}_quantity`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Average Price
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              value={holding.avgPrice}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHolding(index, 'avgPrice', parseFloat(e.target.value) || 0)}
                              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                errors[`holding_${index}_avgPrice`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          {errors[`holding_${index}_avgPrice`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`holding_${index}_avgPrice`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Status */}
            {submitStatus && (
              <div className={`p-4 rounded-lg ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {submitStatus.message}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                } text-white`}
              >
                {isSubmitting ? 'Creating Portfolio...' : 'Create Portfolio'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortfolioForm