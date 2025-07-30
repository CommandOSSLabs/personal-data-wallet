'use client'

import { useState } from 'react'
import { BlockchainButton } from '@/app/components/ui/blockchain-button'
import { CyberInput } from '@/app/components/ui/cyber-input'
import { Send, Loader2, Cpu, Shield } from 'lucide-react'

interface CyberChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function CyberChatInput({ onSendMessage, isLoading, disabled }: CyberChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-cyan-500/20 bg-gray-900/90 backdrop-blur-sm">
      <div className="px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1 relative">
            <CyberInput
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter neural command..."
              disabled={disabled || isLoading}
              variant="glow"
              className="pr-20"
            />
            
            {/* Status indicators */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs font-mono text-green-400">SECURE</span>
              </div>
              {isLoading && (
                <div className="flex items-center space-x-1">
                  <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-mono text-cyan-400">PROCESSING</span>
                </div>
              )}
            </div>
          </div>
          
          <BlockchainButton 
            type="submit" 
            disabled={disabled || isLoading || !message.trim()}
            size="lg"
            variant="primary"
            glow
            className="min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>EXEC</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="h-4 w-4" />
                <span>SEND</span>
              </div>
            )}
          </BlockchainButton>
        </form>
        
        {/* Status bar */}
        <div className="flex items-center justify-between mt-3 text-xs font-mono text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Neural Network Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span>Blockchain Synced</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span>Memory Graph Online</span>
            </div>
          </div>
          <div className="text-cyan-400">
            {message.length}/512
          </div>
        </div>
      </div>
    </div>
  )
}