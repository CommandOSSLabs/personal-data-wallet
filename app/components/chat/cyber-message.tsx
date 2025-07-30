'use client'

import { Message } from '@/app/types'
import { clsx } from 'clsx'
import { User, Bot, Database, Zap } from 'lucide-react'

interface CyberMessageProps {
  message: Message
  isTyping?: boolean
}

export function CyberMessage({ message, isTyping = false }: CyberMessageProps) {
  const isUser = message.type === 'user'
  
  return (
    <div className={clsx(
      'flex w-full mb-6 group',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={clsx(
        'flex max-w-[80%] space-x-3',
        isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={clsx(
          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border-2 shadow-lg',
          isUser 
            ? 'bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-400 shadow-purple-500/20' 
            : 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400 shadow-cyan-500/20'
        )}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>
        
        {/* Message Bubble */}
        <div className={clsx(
          'relative rounded-lg border backdrop-blur-sm transition-all duration-300 group-hover:shadow-lg',
          isUser 
            ? 'bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border-purple-400/30 group-hover:shadow-purple-500/20' 
            : 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-cyan-400/30 group-hover:shadow-cyan-500/20'
        )}>
          {/* Corner decorations */}
          <div className={clsx(
            "absolute top-0 left-0 w-2 h-2 border-t border-l transition-opacity duration-300",
            isUser ? "border-purple-400/50" : "border-cyan-400/50",
            "opacity-0 group-hover:opacity-100"
          )} />
          <div className={clsx(
            "absolute top-0 right-0 w-2 h-2 border-t border-r transition-opacity duration-300",
            isUser ? "border-purple-400/50" : "border-cyan-400/50",
            "opacity-0 group-hover:opacity-100"
          )} />
          <div className={clsx(
            "absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-opacity duration-300",
            isUser ? "border-purple-400/50" : "border-cyan-400/50",
            "opacity-0 group-hover:opacity-100"
          )} />
          <div className={clsx(
            "absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-opacity duration-300",
            isUser ? "border-purple-400/50" : "border-cyan-400/50",
            "opacity-0 group-hover:opacity-100"
          )} />
          
          <div className="px-4 py-3">
            {/* Message Content */}
            <div className={clsx(
              'font-mono text-sm leading-relaxed',
              isUser ? 'text-purple-100' : 'text-cyan-100'
            )}>
              {isTyping ? (
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-gray-400">Processing neural pathways...</span>
                </div>
              ) : (
                <>
                  {message.content.split('\n').map((line, index) => (
                    <div key={index} className="mb-1 last:mb-0">
                      {line}
                    </div>
                  ))}
                </>
              )}
            </div>
            
            {/* Metadata */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700/50">
              <div className="flex items-center space-x-2 text-xs">
                {!isUser && (
                  <>
                    <Database className="w-3 h-3 text-cyan-400" />
                    <span className="text-gray-400">Neural Memory</span>
                    <Zap className="w-3 h-3 text-green-400" />
                    <span className="text-gray-400">Blockchain Verified</span>
                  </>
                )}
              </div>
              <time className={clsx(
                'text-xs font-mono',
                isUser ? 'text-purple-300/70' : 'text-cyan-300/70'
              )}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </time>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}