'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChatSession, Message, MemoryItem } from '@/app/types'
import { useSuiAuth } from './use-sui-auth'

const API_BASE = 'http://localhost:8000'

export function useChatSessions() {
  const { getUserId } = useSuiAuth()
  const USER_ID = getUserId()
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Load currentSessionId from localStorage
  useEffect(() => {
    const savedCurrentSessionId = localStorage.getItem('current-session-id')
    if (savedCurrentSessionId) {
      setCurrentSessionId(savedCurrentSessionId)
    }
  }, [])

  // Save currentSessionId to localStorage
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('current-session-id', currentSessionId)
    } else {
      localStorage.removeItem('current-session-id')
    }
  }, [currentSessionId])

  // Fetch chat sessions from backend
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['chat-sessions', USER_ID],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/chats/${USER_ID}`)
      if (!response.ok) throw new Error('Failed to fetch sessions')
      const data = await response.json()
      return data.sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
    }
  })

  // Fetch memories from backend
  const { data: memories = [], isLoading: memoriesLoading } = useQuery({
    queryKey: ['memories', USER_ID],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/memories/${USER_ID}`)
      if (!response.ok) throw new Error('Failed to fetch memories')
      const data = await response.json()
      return data.memories.map((memory: any) => ({
        ...memory,
        createdAt: new Date(memory.created_at),
        relatedSessions: memory.related_sessions || []
      }))
    }
  })

  // Create new chat session
  const createSessionMutation = useMutation({
    mutationFn: async (title: string = 'New Chat') => {
      const response = await fetch(`${API_BASE}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: USER_ID, title })
      })
      if (!response.ok) throw new Error('Failed to create session')
      return await response.json()
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', USER_ID] })
      setCurrentSessionId(newSession.id)
    }
  })

  // Delete chat session
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`${API_BASE}/chats/${USER_ID}/${sessionId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete session')
      return await response.json()
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', USER_ID] })
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
      }
    }
  })

  // Create memory
  const createMemoryMutation = useMutation({
    mutationFn: async ({ content, rawText, type, category }: {
      content: string
      rawText: string
      type: 'fact' | 'preference' | 'context'
      category?: string
    }) => {
      const response = await fetch(`${API_BASE}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: USER_ID,
          content,
          raw_text: rawText,
          type,
          category: category || 'general',
          related_session_id: currentSessionId
        })
      })
      if (!response.ok) throw new Error('Failed to create memory')
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', USER_ID] })
    }
  })

  // Clear memories
  const clearMemoriesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/memories/${USER_ID}/clear`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to clear memories')
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', USER_ID] })
    }
  })

  const getCurrentSession = (): ChatSession | null => {
    console.log('getCurrentSession - currentSessionId:', currentSessionId)
    console.log('getCurrentSession - available sessions:', sessions.map(s => s.id))
    
    if (!currentSessionId) return null
    const session = sessions.find(session => session.id === currentSessionId)
    console.log('getCurrentSession - found session:', session)
    return session || null
  }

  const createNewSession = async (): Promise<string> => {
    return new Promise((resolve) => {
      createSessionMutation.mutate('New Chat', {
        onSuccess: (newSession) => {
          resolve(newSession.id)
        },
        onError: () => {
          // Fallback to temp ID on error
          const tempId = `temp_${Date.now()}`
          resolve(tempId)
        }
      })
    })
  }

  const addMessageToSession = (sessionId: string, message: Message) => {
    console.log('addMessageToSession called with:', { sessionId, message })
    
    // Optimistically update the UI
    queryClient.setQueryData(['chat-sessions', USER_ID], (oldSessions: ChatSession[] = []) => {
      console.log('Current sessions:', oldSessions)
      
      // Find existing session or create temporary one
      let sessionExists = false
      const updatedSessions = oldSessions.map(session => {
        if (session.id === sessionId) {
          sessionExists = true
          
          // Check if message already exists to avoid duplicates
          const existingMessageIndex = session.messages.findIndex(m => m.id === message.id)
          let updatedMessages
          
          if (existingMessageIndex >= 0) {
            // Update existing message (for streaming)
            updatedMessages = [...session.messages]
            updatedMessages[existingMessageIndex] = message
          } else {
            // Add new message
            updatedMessages = [...session.messages, message]
          }
          
          // Update title if it's the first user message
          let title = session.title
          if (title === 'New Chat' && message.type === 'user') {
            title = message.content.length > 50 
              ? message.content.substring(0, 50) + '...' 
              : message.content
          }

          return {
            ...session,
            title,
            messages: updatedMessages,
            updatedAt: new Date()
          }
        }
        return session
      })
      
      // If session doesn't exist, create a temporary one
      if (!sessionExists) {
        console.log('Session not found, creating temporary session')
        const tempSession: ChatSession = {
          id: sessionId,
          title: message.type === 'user' ? (message.content.length > 50 
            ? message.content.substring(0, 50) + '...' 
            : message.content) : 'New Chat',
          messages: [message],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        return [tempSession, ...updatedSessions]
      }
      
      return updatedSessions
    })
  }

  const deleteSession = (sessionId: string) => {
    deleteSessionMutation.mutate(sessionId)
  }

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
  }

  const addMemory = (content: string, type: 'fact' | 'preference' | 'context', category: string = 'general') => {
    createMemoryMutation.mutate({
      content,
      rawText: content,
      type,
      category
    })
  }

  const clearMemories = () => {
    clearMemoriesMutation.mutate()
  }

  const addFactMemory = (fact: string, category: string = 'facts') => {
    addMemory(fact, 'fact', category)
  }

  return {
    sessions,
    currentSessionId,
    memories,
    sessionsLoading,
    memoriesLoading,
    getCurrentSession,
    createNewSession,
    addMessageToSession,
    deleteSession,
    selectSession,
    addMemory,
    addFactMemory,
    clearMemories
  }
}