'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChatSession, Message } from '@/app/types'
import { useSuiAuth } from './use-sui-auth'
import { chatApi } from '../api/chatApi'
import { DEFAULT_MODEL_ID } from '@/app/config/models'

export function useChatSessions() {
  const queryClient = useQueryClient()
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  
  const { userAddress } = useSuiAuth()
  
  // Query to get all user sessions (without messages for performance)
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError
  } = useQuery({
    queryKey: ['chat-sessions', userAddress],
    queryFn: async () => {
      if (!userAddress) return { sessions: [] }

      const response = await chatApi.getSessions(userAddress)
      return { sessions: response.sessions || [] }
    },
    enabled: !!userAddress,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  // Query to get current session with messages
  const {
    data: currentSessionData,
    isLoading: currentSessionLoading,
    error: currentSessionError
  } = useQuery({
    queryKey: ['chat-session', currentSessionId, userAddress],
    queryFn: async () => {
      if (!currentSessionId || !userAddress) return null

      const response = await chatApi.getSession(currentSessionId, userAddress)
      return response.session || null
    },
    enabled: !!currentSessionId && !!userAddress,
    staleTime: 10000, // Shorter stale time for active session
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })
  
  // Convert backend session format to frontend format
  // Note: getSessions() returns sessions without messages for performance
  // Individual session messages are loaded separately via getSession()
  const sessions: ChatSession[] = (sessionsData?.sessions || []).map((session) => ({
    id: session?.id || '',
    title: session?.title || 'Untitled Chat',
    messages: (session?.messages || []).map(msg => ({
      id: msg?.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      content: msg?.content || '',
      type: msg?.type || (msg?.role === 'user' ? 'user' : 'assistant'),
      timestamp: msg?.timestamp || new Date().toISOString(),
      memoryDetected: msg?.memory_detected || false,
      memoryId: msg?.memory_id || null
    })),
    createdAt: new Date(session?.created_at || Date.now()),
    updatedAt: new Date(session?.updated_at || Date.now())
  }))

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!userAddress) {
        throw new Error('No user address')
      }

      try {
        // Create session directly in PostgreSQL via backend
        const response = await chatApi.createSession({
          userAddress,
          title,
          modelName: DEFAULT_MODEL_ID
        })
        
        return { 
          success: true, 
          session: { 
            id: response.session?.id || '', 
            title 
          } 
        }
      } catch (error) {
        console.error('Session creation error:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })

      // Set as current session
      const sessionId = data.session?.id || ''
      if (!sessionId) {
        console.error('No session ID in successful response:', data)
      }
      setCurrentSessionId(sessionId)
    }
  })

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async ({ 
      sessionId, 
      content, 
      type
    }: {
      sessionId: string
      content: string
      type: 'user' | 'assistant'
    }) => {
      if (!userAddress) throw new Error('No user address')

      try {
        // Add message directly to PostgreSQL via backend
        const response = await chatApi.addMessage(sessionId, {
          userAddress,
          content,
          type
        })
        
        return { success: true }
      } catch (error) {
        console.error('Error adding message:', error)
        throw error
      }
    },
    onSuccess: () => {
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })
    }
  })

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!userAddress) throw new Error('No user address')

      try {
        // Delete session in PostgreSQL via backend
        await chatApi.deleteSession(sessionId, userAddress)
        
        return { success: true }
      } catch (error) {
        console.error('Error deleting session:', error)
        throw error
      }
    },
    onSuccess: (_, deletedSessionId) => {
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })
      
      // Clear current session if it was deleted
      if (currentSessionId === deletedSessionId) {
        setCurrentSessionId(null)
      }
    }
  })

  // Helper functions
  const getCurrentSession = useCallback((): ChatSession | null => {
    if (!currentSessionId) return null

    // If we have current session data with messages, use that
    if (currentSessionData) {
      return {
        id: currentSessionData.id,
        title: currentSessionData.title,
        messages: (currentSessionData.messages || []).map(msg => ({
          id: msg?.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          content: msg?.content || '',
          type: msg?.type || (msg?.role === 'user' ? 'user' : 'assistant'),
          timestamp: msg?.timestamp || new Date().toISOString(),
          memoryDetected: msg?.memory_detected || false,
          memoryId: msg?.memory_id || null
        })),
        createdAt: new Date(currentSessionData.created_at || Date.now()),
        updatedAt: new Date(currentSessionData.updated_at || Date.now())
      }
    }

    // Fallback to session list (without messages)
    return sessions.find(session => session.id === currentSessionId) || null
  }, [currentSessionId, sessions, currentSessionData])

  const createNewSession = useCallback(async (title?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Generate smart title based on time if no title provided
      const defaultTitle = title || `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

      createSessionMutation.mutate(defaultTitle, {
        onSuccess: (data) => {
          const sessionId = data.session?.id || ''
          resolve(sessionId)
        },
        onError: (error) => {
          reject(error)
        }
      })
    })
  }, [createSessionMutation])

  const addMessageToSession = useCallback(async (
    sessionId: string, 
    content: string, 
    type: 'user' | 'assistant'
  ) => {
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
  }, [addMessageMutation])

  const deleteSession = useCallback((sessionId: string) => {
    deleteSessionMutation.mutate(sessionId)
  }, [deleteSessionMutation])

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId)
  }, [])
  
  // This function is no longer needed with PostgreSQL
  const executePendingTransactions = useCallback(async (): Promise<boolean> => {
    return true
  }, [])

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
    currentSessionLoading,
    currentSessionError,
    getCurrentSession,
    createNewSession,
    addMessageToSession,
    deleteSession,
    selectSession,
    executePendingTransactions,
    isCreatingSession: createSessionMutation.isPending,
    isAddingMessage: addMessageMutation.isPending,
    isDeletingSession: deleteSessionMutation.isPending
  }
}