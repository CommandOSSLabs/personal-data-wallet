'use client'

import { useState } from 'react'
import { CyberChatWindow } from './cyber-chat-window'
import { CyberChatInput } from './cyber-chat-input'
import { TerminalWindow } from '@/app/components/ui/terminal-window'
import { useSendMessage } from '@/app/hooks/use-send-message'
import { Message } from '@/app/types'
import { Shield, Database, Globe, Cpu, Zap } from 'lucide-react'

export function CyberChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const sendMessageMutation = useSendMessage()

  const handleSendMessage = async (messageText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      type: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])

    try {
      const response = await sendMessageMutation.mutateAsync({
        text: messageText,
        userId: 'default-user',
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        type: 'assistant',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '⚠️ SYSTEM ERROR: Neural pathway disrupted. Please retry connection.',
        type: 'assistant',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, errorMessage])
    }
  }

  return (
    <div className="min-h-screen bg-black p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_0%,_rgba(0,255,255,0.05)_50%,_transparent_100%)]" />
      
      {/* Main Interface */}
      <div className="relative z-10 max-w-6xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-mono font-bold text-cyan-400">
                    PERSONAL DATA WALLET
                  </h1>
                  <p className="text-xs font-mono text-gray-400">
                    Decentralized Neural Memory Interface v2.0
                  </p>
                </div>
              </div>
            </div>
            
            {/* System Status */}
            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-green-400">SECURE</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400">CHAIN-SYNC</span>
              </div>
              <div className="flex items-center space-x-1">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400">AI-ACTIVE</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat Interface */}
        <div className="flex-1 min-h-0">
          <TerminalWindow 
            title="neural-memory-core://localhost:8000" 
            className="h-full flex flex-col"
          >
            <CyberChatWindow 
              messages={messages} 
              isLoading={sendMessageMutation.isPending}
            />
            
            <CyberChatInput
              onSendMessage={handleSendMessage}
              isLoading={sendMessageMutation.isPending}
            />
          </TerminalWindow>
        </div>
        
        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs font-mono text-gray-500">
            Powered by Sui Blockchain • Secured by Walrus • Enhanced by Gemini AI
          </p>
        </div>
      </div>
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  )
}