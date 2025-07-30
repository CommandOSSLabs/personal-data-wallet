'use client'

import { useState } from 'react'
import { ChevronDown, Bot, Sparkles, Zap, Cpu } from 'lucide-react'

export type ModelType = 'gemini' | 'gpt-4' | 'claude' | 'local'

interface ModelOption {
  id: ModelType
  name: string
  description: string
  icon: React.ReactNode
  available: boolean
}

const models: ModelOption[] = [
  {
    id: 'gemini',
    name: 'Gemini Pro',
    description: 'Google\'s advanced AI model',
    icon: <Sparkles className="h-4 w-4 text-blue-500" />,
    available: true
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'OpenAI\'s powerful language model',
    icon: <Bot className="h-4 w-4 text-green-500" />,
    available: false
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic\'s helpful AI assistant',
    icon: <Zap className="h-4 w-4 text-orange-500" />,
    available: false
  },
  {
    id: 'local',
    name: 'Local Model',
    description: 'Run locally for privacy',
    icon: <Cpu className="h-4 w-4 text-purple-500" />,
    available: false
  }
]

interface ModelSelectorProps {
  selectedModel: ModelType
  onModelChange: (model: ModelType) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedModelData = models.find(m => m.id === selectedModel) || models[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selectedModelData.icon}
        <span className="font-medium">{selectedModelData.name}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  if (model.available) {
                    onModelChange(model.id)
                    setIsOpen(false)
                  }
                }}
                disabled={!model.available}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 ${
                  !model.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${selectedModel === model.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''}`}
              >
                {model.icon}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{model.name}</span>
                    {!model.available && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{model.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}