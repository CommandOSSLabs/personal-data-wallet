'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSuiBlockchain } from '../services/suiBlockchainService'
import { ChatSession, Message } from '@/app/types'
import { chatApi } from '../api/chatApi'

export function useDirectSuiSessions() {
  const queryClient = useQueryClient()
  const { service, wallet } = useSuiBlockchain()
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  
  // Get the user address from the wallet
  const userAddress = wallet.account?.address || null
  
  // Query to get all user sessions (still from backend API)
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError
  } = useQuery({
    queryKey: ['direct-sui-sessions', userAddress],
    queryFn: async () => {
      if (!userAddress) return { sessions: [] }

      const response = await chatApi.getSessions(userAddress)
      return { sessions: response.sessions || [] }
    },
    enabled: !!userAddress,
    staleTime: 30000, // 30 seconds
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

  // Create session mutation - directly on blockchain
  const createSessionMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!userAddress) {
        throw new Error('No user address')
      }

      try {
        console.log('Creating new session with direct blockchain transaction')
        
        // Create session directly on blockchain via wallet
        const sessionId = await service.createChatSession('gemini-1.5-pro')
        
        console.log('Created session with ID:', sessionId)
        
        // Notify backend about the new session for indexing
        // This is optional and depends on your architecture
        await chatApi.createSession({
          userAddress,
          title,
          modelName: 'gemini-1.5-pro',
          suiObjectId: sessionId // Pass the object ID from the blockchain
        })
        
        return { 
          success: true, 
          session: { 
            id: sessionId, 
            title 
          } 
        }
      } catch (error) {
        console.error('Direct session creation error:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ['direct-sui-sessions', userAddress] })

      // Set as current session
      const sessionId = data.session?.id || ''
      if (!sessionId) {
        console.error('No session ID in successful response:', data)
      }
      setCurrentSessionId(sessionId)
    }
  })

  // Add message mutation - directly on blockchain
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
        // Add message directly on blockchain via wallet
        await service.addMessageToSession(
          sessionId,
          type === 'user' ? 'user' : 'assistant',
          content
        )
        
        // Optionally notify backend about the new message
        // This is for indexing and other backend services
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
      queryClient.invalidateQueries({ queryKey: ['direct-sui-sessions', userAddress] })
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
          console.log('CreateNewSession response:', data)
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

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId)
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
    getCurrentSession,
    createNewSession,
    addMessageToSession,
    selectSession,
    isCreatingSession: createSessionMutation.isPending,
    isAddingMessage: addMessageMutation.isPending
  }
}