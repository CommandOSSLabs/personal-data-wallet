'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

interface SendMessageRequest {
  text: string
  userId: string
  sessionId?: string
  model?: string
}

interface SendMessageResponse {
  response: string
  intent: string
  entities?: {
    nodes: string[]
    edges: Array<{ source: string; target: string; label: string }>
  }
  success: boolean
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation<SendMessageResponse, Error, SendMessageRequest>({
    mutationFn: async (data: SendMessageRequest) => {
      const response = await fetch(`${API_BASE}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: data.text,
          user_id: data.userId,
          session_id: data.sessionId,
          model: data.model || 'gemini'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      
      return await response.json()
    },
    onSuccess: () => {
      // Only invalidate memories, let optimistic updates handle chat sessions
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
    onError: (error) => {
      console.error('Failed to send message:', error)
    },
  })
}