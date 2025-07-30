'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChatSession, Message } from '@/app/types'
import { chatApi } from '@/app/api'

interface SuiChatSession {
  id: string
  owner: string
  title: string
  messages: Array<{
    id: string
    content: string
    type: 'user' | 'assistant'
    timestamp: string
  }>
  created_at: string
  updated_at: string
  message_count: number
  sui_object_id: string
}

export function useSuiChatSessions(userAddress: string | null) {
  const queryClient = useQueryClient()
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Query to get all user sessions
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError
  } = useQuery({
    queryKey: ['sui-chat-sessions', userAddress],
    queryFn: async () => {
      if (!userAddress) return { sessions: [] }

      const response = await chatApi.getSessions(userAddress)

      return { sessions: response.sessions || [] }
    },
    enabled: !!userAddress,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
    retry: (failureCount, error) => {
      // Don't retry on 404 or other client errors
      if (error instanceof Error && error.message.includes('404')) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  const sessions: ChatSession[] = (sessionsData?.sessions || []).map((suiSession: SuiChatSession) => ({
    id: suiSession.id,
    title: suiSession.title,
    messages: suiSession.messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      type: msg.type,
      timestamp: msg.timestamp // Keep as string
    })),
    createdAt: new Date(suiSession.created_at),
    updatedAt: new Date(suiSession.updated_at)
  }))

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!userAddress) throw new Error('No user address')

      const response = await chatApi.createSession({
        userAddress,
        title
      })

      return response
    },
    onSuccess: (data) => {
      console.log('Create session response:', data)
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ['sui-chat-sessions', userAddress] })

      // Set as current session - backend returns { success: true, session: {...} }
      const sessionId = data.session?.id || ''
      console.log('Extracted session ID:', sessionId)
      setCurrentSessionId(sessionId)
    }
  })

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async ({ sessionId, content, type }: {
      sessionId: string
      content: string
      type: 'user' | 'assistant'
    }) => {
      if (!userAddress) throw new Error('No user address')

      const response = await chatApi.addMessage(sessionId, {
        userAddress,
        content,
        type
      })

      return response
    },
    onSuccess: () => {
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ['sui-chat-sessions', userAddress] })
    }
  })

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!userAddress) throw new Error('No user address')

      const response = await chatApi.deleteSession(sessionId, userAddress)
      return response
    },
    onSuccess: (_, deletedSessionId) => {
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ['sui-chat-sessions', userAddress] })
      
      // Clear current session if it was deleted
      if (currentSessionId === deletedSessionId) {
        setCurrentSessionId(null)
      }
    }
  })

  // Helper functions
  const getCurrentSession = (): ChatSession | null => {
    if (!currentSessionId) return null
    return sessions.find(session => session.id === currentSessionId) || null
  }

  const createNewSession = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      createSessionMutation.mutate('New Chat', {
        onSuccess: (data) => {
          console.log('CreateNewSession response:', data)
          // Backend returns { success: true, session: {...} }
          const sessionId = data.session?.id || ''
          console.log('CreateNewSession extracted ID:', sessionId)
          resolve(sessionId)
        },
        onError: (error) => {
          reject(error)
        }
      })
    })
  }

  const addMessageToSession = async (sessionId: string, content: string, type: 'user' | 'assistant') => {
    return new Promise((resolve, reject) => {
      addMessageMutation.mutate({ sessionId, content, type }, {
        onSuccess: () => {
          resolve(true)
        },
        onError: (error) => {
          reject(error)
        }
      })
    })
  }

  const deleteSession = async (sessionId: string) => {
    return new Promise((resolve, reject) => {
      deleteSessionMutation.mutate(sessionId, {
        onSuccess: () => {
          resolve(true)
        },
        onError: (error) => {
          reject(error)
        }
      })
    })
  }

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
  }

  // Auto-select first session if none selected
  useEffect(() => {
    if (!currentSessionId && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id)
    }
  }, [sessions, currentSessionId])

  // Store current session ID in localStorage
  useEffect(() => {
    if (currentSessionId && userAddress) {
      localStorage.setItem(`currentSessionId_${userAddress}`, currentSessionId)
    }
  }, [currentSessionId, userAddress])

  // Load current session ID from localStorage
  useEffect(() => {
    if (userAddress && !currentSessionId) {
      const stored = localStorage.getItem(`currentSessionId_${userAddress}`)
      if (stored && sessions.some(s => s.id === stored)) {
        setCurrentSessionId(stored)
      }
    }
  }, [userAddress, sessions, currentSessionId])

  return {
    sessions,
    currentSessionId,
    sessionsLoading,
    sessionsError,
    getCurrentSession,
    createNewSession,
    addMessageToSession,
    deleteSession,
    selectSession,
    // Mutation states
    isCreatingSession: createSessionMutation.isPending,
    isAddingMessage: addMessageMutation.isPending,
    isDeletingSession: deleteSessionMutation.isPending
  }
}
