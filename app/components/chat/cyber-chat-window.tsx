'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/app/types'
import { CyberMessage } from './cyber-message'
import { Database, Activity, Globe, Cpu } from 'lucide-react'

interface CyberChatWindowProps {
  messages: Message[]
  isLoading?: boolean
}

export function CyberChatWindow({ messages, isLoading }: CyberChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,255,255,0.03)_50%,_transparent_100%)]" />
      
      {/* Matrix-like background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300ffff' fill-opacity='0.3'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      <div className="relative h-full overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-cyan-500/20">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto">
              {/* Welcome Animation */}
              <div className="mb-8 relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/25 animate-pulse">
                  <Database className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-cyan-400/30 animate-ping" />
              </div>
              
              <h2 className="text-2xl font-mono font-bold text-cyan-400 mb-4">
                NEURAL INTERFACE ACTIVE
              </h2>
              <p className="text-gray-400 font-mono mb-6 leading-relaxed">
                Welcome to the Personal Data Wallet neural network. Your decentralized memory layer is now online and ready to process information.
              </p>
              
              {/* System Status */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="flex items-center justify-center space-x-2 p-3 border border-cyan-500/20 rounded-lg bg-cyan-500/5">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">KNOWLEDGE GRAPH</span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-3 border border-cyan-500/20 rounded-lg bg-cyan-500/5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400">BLOCKCHAIN SYNC</span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-3 border border-cyan-500/20 rounded-lg bg-cyan-500/5">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400">VECTOR SEARCH</span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-3 border border-cyan-500/20 rounded-lg bg-cyan-500/5">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400">MEMORY CORE</span>
                </div>
              </div>
              
              <p className="text-cyan-300/70 font-mono text-sm mt-6">
                Ready to receive neural input...
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <CyberMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <CyberMessage 
                message={{
                  id: 'loading',
                  content: '',
                  type: 'assistant',
                  timestamp: new Date()
                }}
                isTyping={true}
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Scanning line effect */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
    </div>
  )
}