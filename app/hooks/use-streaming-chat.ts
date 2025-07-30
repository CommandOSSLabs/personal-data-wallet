'use client'

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const API_BASE = 'http://localhost:8000'

interface StreamingChatRequest {
  text: string
  userId: string
  sessionId?: string
  model?: string
}

interface StreamChunk {
  type: 'start' | 'chunk' | 'end'
  content?: string
  intent?: string
  entities?: any
}

interface StreamingState {
  isStreaming: boolean
  currentResponse: string
  error: string | null
}

export function useStreamingChat() {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentResponse: '',
    error: null
  })
  
  const queryClient = useQueryClient()

  const sendStreamingMessage = useCallback(async (
    request: StreamingChatRequest,
    onChunk?: (chunk: string) => void,
    onComplete?: (fullResponse: string, intent?: string, entities?: any) => void,
    onError?: (error: string) => void
  ) => {
    try {
      setStreamingState({
        isStreaming: true,
        currentResponse: '',
        error: null
      })

      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          user_id: request.userId,
          session_id: request.sessionId,
          model: request.model || 'gemini'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()
      let fullResponse = ''
      let intent = ''
      let entities = null

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data: StreamChunk = JSON.parse(line.slice(6))
                
                if (data.type === 'start') {
                  intent = data.intent || ''
                  console.log('Stream started, intent:', intent)
                } else if (data.type === 'chunk' && data.content) {
                  fullResponse += data.content
                  setStreamingState(prev => ({
                    ...prev,
                    currentResponse: fullResponse
                  }))
                  onChunk?.(data.content)
                } else if (data.type === 'end') {
                  entities = data.entities
                  console.log('Stream ended, entities:', entities)
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', line)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      setStreamingState({
        isStreaming: false,
        currentResponse: fullResponse,
        error: null
      })

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['memories', request.userId] })
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', request.userId] })
      
      onComplete?.(fullResponse, intent, entities)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Streaming error:', error)
      
      setStreamingState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorMessage
      }))
      
      onError?.(errorMessage)
    }
  }, [queryClient])

  const resetStreaming = useCallback(() => {
    setStreamingState({
      isStreaming: false,
      currentResponse: '',
      error: null
    })
  }, [])

  return {
    sendStreamingMessage,
    resetStreaming,
    ...streamingState
  }
}