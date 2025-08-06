'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChatSession, Message } from '@/app/types'
import { useSuiAuth } from './use-sui-auth'
import { useSuiBlockchain } from '../services/suiBlockchainService'
import { chatApi } from '../api/chatApi'
import { DEFAULT_MODEL_ID } from '@/app/config/models'

export function useChatSessions() {
  const queryClient = useQueryClient()
  const { service, wallet } = useSuiBlockchain()
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  
  const { userAddress } = useSuiAuth()
  
  // Query to get all user sessions
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
  
  // Convert backend session format to frontend format
  const sessions: ChatSession[] = (sessionsData?.sessions || []).map((session) => ({
    id: session.id,
    title: session.title,
    messages: session.messages.map(msg => ({
      id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      content: msg.content,
      type: msg.type || (msg.role === 'user' ? 'user' : 'assistant'),
      timestamp: msg.timestamp || new Date().toISOString(),
      memoryDetected: msg.memory_detected,
      memoryId: msg.memory_id
    })),
    createdAt: new Date(session.created_at),
    updatedAt: new Date(session.updated_at)
  }))

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!userAddress) {
        throw new Error('No user address')
      }

      try {
        // Create session directly on blockchain via wallet
        const sessionId = await service.createChatSession(DEFAULT_MODEL_ID)
        
        // Notify backend about the new session for indexing
        await chatApi.createSession({
          userAddress,
          title,
          modelName: DEFAULT_MODEL_ID,
          suiObjectId: sessionId
        })
        
        return { 
          success: true, 
          session: { 
            id: sessionId, 
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
      type,
      executeBatch = false
    }: {
      sessionId: string
      content: string
      type: 'user' | 'assistant'
      executeBatch?: boolean
    }) => {
      if (!userAddress) throw new Error('No user address')

      try {
        // Add message to batch and optionally execute
        await service.addMessageToSession(
          sessionId,
          type === 'user' ? 'user' : 'assistant',
          content,
          executeBatch
        )
        
        // Notify backend about the new message for indexing
        await chatApi.addMessage(sessionId, {
          userAddress,
          content,
          type
        })
        
        return { success: true }
      } catch (error) {
        console.error('Error adding message to blockchain:', error)
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
        // Delete session on blockchain
        await service.deleteSession(sessionId)
        
        // Update backend index
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
    return sessions.find(session => session.id === currentSessionId) || null
  }, [currentSessionId, sessions])

  const createNewSession = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      createSessionMutation.mutate('New Chat', {
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
    type: 'user' | 'assistant',
    executeBatch = false
  ) => {
    return new Promise((resolve, reject) => {
      addMessageMutation.mutate({ sessionId, content, type, executeBatch }, {
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
  
  const executePendingTransactions = useCallback(async (): Promise<boolean> => {
    try {
      return await service.executePendingTransactions()
    } catch (error) {
      console.error('Error executing pending transactions:', error)
      return false
    }
  }, [service])

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
    executePendingTransactions,
    isCreatingSession: createSessionMutation.isPending,
    isAddingMessage: addMessageMutation.isPending,
    isDeletingSession: deleteSessionMutation.isPending
  }
}