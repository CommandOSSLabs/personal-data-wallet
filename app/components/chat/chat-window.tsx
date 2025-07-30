'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/app/types'
import { MessageComponent } from './message'

interface ChatWindowProps {
  messages: Message[]
  isLoading?: boolean
  streamingMessageId?: string | null
  streamingContent?: string
}

export function ChatWindow({ messages, isLoading, streamingMessageId, streamingContent }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500 max-w-md">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">How can I help you today?</h2>
              <p className="text-gray-600">I'm your personal data wallet. I can store information and answer questions about what you've shared with me.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="py-4">
            {messages.map((message) => {
              // If this is the streaming message, show the streaming content
              if (streamingMessageId && message.id === streamingMessageId && streamingContent !== undefined) {
                return (
                  <MessageComponent 
                    key={message.id} 
                    message={{
                      ...message,
                      content: streamingContent
                    }}
                    isStreaming={true}
                  />
                )
              }
              return <MessageComponent key={message.id} message={message} />
            })}
            {isLoading && !streamingMessageId && (
              <MessageComponent 
                message={{
                  id: 'loading',
                  content: '',
                  type: 'assistant',
                  timestamp: new Date()
                }}
                isTyping={true}
              />
            )}
          </div>
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}