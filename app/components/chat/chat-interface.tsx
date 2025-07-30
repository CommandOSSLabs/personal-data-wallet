'use client'

import { useEffect, useState } from 'react'
import { ChatWindow } from './chat-window'
import { ChatInput } from './chat-input'
import { ModelSelector, ModelType } from './model-selector'
import { Sidebar } from '@/app/components/sidebar/sidebar'
import { useSendMessage } from '@/app/hooks/use-send-message'
import { useStreamingChat } from '@/app/hooks/use-streaming-chat'
import { useChatSessions } from '@/app/hooks/use-chat-sessions'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { Message } from '@/app/types'
import { LogOut, User } from 'lucide-react'

export function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini')
  
  const {
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
    addFactMemory,
    clearMemories
  } = useChatSessions()

  const { logout, userAddress } = useSuiAuth()
  const sendMessageMutation = useSendMessage()
  const { sendStreamingMessage, isStreaming, currentResponse, resetStreaming } = useStreamingChat()
  const currentSession = getCurrentSession()

  // State for streaming message
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)

  // Create initial session if none exists and data is loaded
  useEffect(() => {
    if (!sessionsLoading && sessions.length === 0 && !currentSessionId) {
      createNewSession().catch(console.error)
    }
  }, [sessions.length, currentSessionId, createNewSession, sessionsLoading])

  const handleSendMessage = async (messageText: string) => {
    console.log('handleSendMessage called with:', messageText)
    
    // Ensure we have an active session
    let sessionId = currentSessionId
    if (!sessionId) {
      console.log('No current session, creating new one...')
      try {
        sessionId = await createNewSession()
        console.log('Created new session with ID:', sessionId)
      } catch (error) {
        console.error('Failed to create session:', error)
        sessionId = `temp_${Date.now()}` // Fallback to temp ID
        selectSession(sessionId)
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      type: 'user',
      timestamp: new Date(),
    }

    addMessageToSession(sessionId, userMessage)
    console.log('Added user message to session:', sessionId)

    // Create a placeholder message for streaming
    const assistantMessageId = (Date.now() + 1).toString()
    setStreamingMessageId(assistantMessageId)
    
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      type: 'assistant',
      timestamp: new Date(),
    }

    addMessageToSession(sessionId, initialAssistantMessage)

    // Reset streaming state
    resetStreaming()

    try {
      await sendStreamingMessage(
        {
          text: messageText,
          userId: 'default-user',
          sessionId: sessionId,
          model: selectedModel,
        },
        // On chunk received
        (chunk: string) => {
          // The currentResponse is managed by the streaming hook
          // We don't need to manually update here as it's handled by the streaming state
        },
        // On complete
        (fullResponse: string, intent?: string, entities?: any) => {
          console.log('Streaming complete:', { fullResponse, intent, entities })
          setStreamingMessageId(null)
          
          // Update with final response
          addMessageToSession(sessionId, {
            ...initialAssistantMessage,
            content: fullResponse
          })
        },
        // On error
        (error: string) => {
          console.error('Streaming error:', error)
          setStreamingMessageId(null)
          
          const errorMessage: Message = {
            id: assistantMessageId,
            content: 'Sorry, there was an error processing your message. Please try again.',
            type: 'assistant',
            timestamp: new Date(),
          }
          
          addMessageToSession(sessionId, errorMessage)
        }
      )

    } catch (error) {
      console.error('Failed to start streaming:', error)
      setStreamingMessageId(null)
      
      const errorMessage: Message = {
        id: assistantMessageId,
        content: 'Sorry, there was an error processing your message. Please try again.',
        type: 'assistant',
        timestamp: new Date(),
      }

      addMessageToSession(sessionId, errorMessage)
    }
  }

  const handleNewChat = () => {
    createNewSession().catch(console.error)
  }

  const handleSelectSession = (sessionId: string) => {
    selectSession(sessionId)
  }

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId)
  }

  if (sessionsLoading || memoriesLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        memories={memories}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClearMemories={clearMemories}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {currentSession?.title || 'Personal Data Wallet'}
              </h1>
              <p className="text-sm text-gray-600">
                Your decentralized memory layer
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <ModelSelector 
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
              
              <div className="text-sm text-gray-500">
                {memories.length} memories stored
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="font-mono text-xs">
                    {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'User'}
                  </span>
                </div>
                
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Chat Content */}
        <div className="flex-1 flex flex-col bg-white">
          <ChatWindow 
            messages={currentSession?.messages || []} 
            isLoading={isStreaming}
            streamingMessageId={streamingMessageId}
            streamingContent={currentResponse}
          />
          
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isStreaming}
          />
        </div>
      </div>
    </div>
  )
}