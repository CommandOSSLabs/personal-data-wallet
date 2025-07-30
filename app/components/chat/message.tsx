'use client'

import { Message } from '@/app/types'
import { clsx } from 'clsx'
import { User, Bot } from 'lucide-react'
import { MarkdownRenderer } from './markdown-renderer'

interface MessageProps {
  message: Message
  isTyping?: boolean
  isStreaming?: boolean
}

export function MessageComponent({ message, isTyping = false, isStreaming = false }: MessageProps) {
  const isUser = message.type === 'user'
  
  return (
    <div className={clsx(
      'flex w-full mb-4 px-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={clsx(
        'flex max-w-[80%] space-x-3',
        isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={clsx(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser 
            ? 'bg-gray-700 text-white' 
            : 'bg-green-600 text-white'
        )}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>
        
        {/* Message Content */}
        <div className={clsx(
          'rounded-lg px-4 py-2 max-w-full',
          isUser 
            ? 'bg-gray-800 text-white' 
            : 'bg-gray-100 text-gray-900'
        )}>
          {isTyping ? (
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : (
            <div className="text-sm leading-relaxed">
              {isUser ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <MarkdownRenderer 
                  content={message.content}
                  className="prose prose-sm max-w-none"
                />
              )}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}