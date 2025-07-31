'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ChatWindow } from './chat-window'
import { ChatInput } from './chat-input'
import { ModelSelector, ModelType } from './model-selector'
import { Sidebar } from '@/app/components/sidebar/sidebar'

import { useStreamingChat } from '@/app/hooks/use-streaming-chat'
import { useSuiChatSessions } from '@/app/hooks/use-sui-chat-sessions'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { Message } from '@/app/types'
import { memoryIntegrationService } from '@/app/services/memoryIntegration'
import { MemoryIndicator, useMemoryIndicator } from '@/app/components/memory/memory-indicator'
import {
  AppShell,
  Group,
  Title,
  Text,
  ActionIcon,
  Badge,
  Loader,
  Center,
  Stack,
  Modal
} from '@mantine/core'
import { IconLogout, IconUser, IconBrain } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { MemoryManager } from '@/app/components/memory/memory-manager'

export function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini')
  const queryClient = useQueryClient()

  // Memory indicator state
  const memoryIndicator = useMemoryIndicator()

  // Memory manager modal
  const [memoryModalOpened, { open: openMemoryModal, close: closeMemoryModal }] = useDisclosure(false)

  const { logout, userAddress } = useSuiAuth()

  const {
    sessions,
    currentSessionId,
    sessionsLoading,
    getCurrentSession,
    createNewSession,
    addMessageToSession,
    deleteSession,
    selectSession
  } = useSuiChatSessions(userAddress)

  // Placeholder for memories - will be integrated with the new memory system
  const memories: any[] = []
  const memoriesLoading = false
  const clearMemories = () => {
    console.log('Clear memories - to be implemented with new memory system')
  }


  const { sendStreamingMessage, isStreaming, currentResponse, resetStreaming } = useStreamingChat()
  const currentSession = getCurrentSession()

  // State for streaming message
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null)

  // State for temporary user message (shown immediately, replaced by backend data)
  const [tempUserMessage, setTempUserMessage] = useState<Message | null>(null)
  
  // Flag to prevent clearing messages during session refresh
  const [isRefreshingSession, setIsRefreshingSession] = useState(false)

  // Don't auto-create sessions - let user initiate first chat
  // This prevents unwanted session creation on page reload

  const handleSendMessage = async (messageText: string) => {
    console.log('handleSendMessage called with:', messageText)

    // Ensure we have an active session
    let sessionId = currentSessionId
    if (!sessionId) {
      console.log('No current session, creating new one...')
      try {
        sessionId = await createNewSession()
        console.log('Created new session with ID:', sessionId)

        if (!sessionId) {
          console.error('Session creation returned empty ID')
          alert('Failed to create chat session. Please try again.')
          return
        }
      } catch (error) {
        console.error('Failed to create session:', error)
        // Show user-friendly error message
        alert('Failed to create chat session. Please try again.')
        return
      }
    }

    console.log('Using session ID:', sessionId)

    // Initialize memory indicator (backend now handles detection automatically)
    memoryIndicator.reset()
    memoryIndicator.startProcessing()

    // Create temporary user message for immediate display (will be replaced by backend data)
    const userMessageId = Date.now().toString()
    const tempUserMessage: Message = {
      id: userMessageId,
      content: messageText,
      type: 'user',
      timestamp: new Date().toISOString(),
    }

    // Create a placeholder message for streaming
    const assistantMessageId = (Date.now() + 1).toString()
    const streamingMsg: Message = {
      id: assistantMessageId,
      content: '',
      type: 'assistant',
      timestamp: new Date().toISOString(), // Use ISO string for consistency
    }

    // Set both temporary user message and streaming assistant message
    setStreamingMessageId(assistantMessageId)
    setStreamingMessage(streamingMsg)

    // Add temporary user message to display immediately
    setTempUserMessage(tempUserMessage)

    // Reset streaming state
    resetStreaming()

    // Get memory context for enhanced AI responses (with timeout and fallback)
    let memoryContext = ''
    try {
      // Add timeout to prevent hanging
      const contextPromise = memoryIntegrationService.generateChatContext(
        messageText,
        currentSession?.messages?.map(m => `${m.type}: ${m.content}`) || [],
        userAddress!,
        'dummy_signature' // TODO: Use real signature when available
      )

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Memory context timeout')), 3000)
      )

      const contextResult = await Promise.race([contextPromise, timeoutPromise]) as any
      memoryContext = contextResult.fullContext || ''
      console.log('Memory context for AI:', memoryContext)
    } catch (error) {
      console.error('Failed to get memory context, continuing without context:', error)
      // Don't let memory context failure break the chat
      memoryContext = ''
    }

    try {
      // Send the user message and context separately to avoid double injection
      const streamingRequest = {
        text: messageText, // Send clean user message
        userId: userAddress!,
        sessionId: sessionId,
        model: selectedModel,
        // Add the original user message so backend can save it correctly
        originalUserMessage: messageText,
        // Send context separately so backend can properly format the prompt
        memoryContext: memoryContext
      }

      console.log('Sending streaming request with context for AI')
      console.log('User message:', messageText)
      console.log('Memory context:', memoryContext)

      await sendStreamingMessage(
        streamingRequest,
        // On chunk received
        (_chunk: string) => {
          // The currentResponse is managed by the streaming hook
          // We don't need to manually update here as it's handled by the streaming state
        },
        // On complete
        async (fullResponse: string, intent?: string, entities?: any, memoryStored?: boolean, memoryId?: string) => {
          console.log('Streaming complete:', { fullResponse, intent, entities, memoryStored, memoryId })

          // Update memory indicator with backend results
          if (memoryStored && memoryId) {
            memoryIndicator.setDetected(1)
            memoryIndicator.setStored(1)
            console.log(`Backend automatically stored memory: ${memoryId}`)
            
            // Update temporary user message with memory detection data
            if (tempUserMessage) {
              const updatedTempMessage: Message = {
                ...tempUserMessage,
                memoryDetected: true,
                memoryId: memoryId
              }
              setTempUserMessage(updatedTempMessage)
            }
          } else {
            memoryIndicator.setDetected(0)
            memoryIndicator.setStored(0)
          }

          // Update the streaming message with the final content
          if (streamingMessage) {
            const finalMessage: Message = {
              ...streamingMessage,
              content: fullResponse
            }
            setStreamingMessage(finalMessage)
          }

          // Don't save the response here - the streaming endpoint already saves it
          // This prevents duplicate messages

          // Refresh the session to get the latest messages
          console.log('Refreshing session data to get latest messages...')
          setIsRefreshingSession(true)
          
          try {
            // Invalidate and refetch session data
            await queryClient.invalidateQueries({ queryKey: ['sui-chat-sessions', userAddress] })
            await queryClient.refetchQueries({ queryKey: ['sui-chat-sessions', userAddress] })
            
            console.log('Session data refreshed successfully')
            
            // Wait a moment to ensure the UI has updated with fresh data
            setTimeout(() => {
              console.log('Clearing temporary message state')
              setStreamingMessageId(null)
              setStreamingMessage(null)
              setTempUserMessage(null)
              setIsRefreshingSession(false)
            }, 100)
          } catch (error) {
            console.error('Failed to refresh session data:', error)
            setIsRefreshingSession(false)
            
            // Keep temporary messages longer if refresh failed
            setTimeout(() => {
              console.log('Clearing temporary message state after error delay')
              setStreamingMessageId(null)
              setStreamingMessage(null)
              setTempUserMessage(null)
            }, 3000)
          }
        },
        // On error
        async (error: string) => {
          console.error('Streaming error:', error)
          setIsRefreshingSession(false)
          
          const errorMessage: Message = {
            id: assistantMessageId,
            content: 'Sorry, there was an error processing your message. Please try again.',
            type: 'assistant',
            timestamp: new Date().toISOString(),
          }
          
          // Replace streaming message with error message
          setStreamingMessage(errorMessage)
          
          try {
            await addMessageToSession(sessionId, errorMessage.content, 'assistant')
            // Refresh session after saving error message
            await queryClient.invalidateQueries({ queryKey: ['sui-chat-sessions', userAddress] })
          } catch (saveError) {
            console.error('Failed to save error message:', saveError)
          }
          
          // Clear state after a delay to show the error message
          setTimeout(() => {
            setStreamingMessageId(null)
            setStreamingMessage(null)
            setTempUserMessage(null)
          }, 5000)
        }
      )

    } catch (error) {
      console.error('Failed to start streaming:', error)
      setIsRefreshingSession(false)
      
      const errorMessage: Message = {
        id: assistantMessageId,
        content: 'Sorry, there was an error starting the conversation. Please try again.',
        type: 'assistant',
        timestamp: new Date().toISOString(),
      }

      // Show error message
      setStreamingMessage(errorMessage)

      try {
        await addMessageToSession(sessionId, errorMessage.content, 'assistant')
        await queryClient.invalidateQueries({ queryKey: ['sui-chat-sessions', userAddress] })
      } catch (saveError) {
        console.error('Failed to save error message:', saveError)
      }
      
      // Clear state after showing error
      setTimeout(() => {
        setStreamingMessageId(null)
        setStreamingMessage(null)
        setTempUserMessage(null)
      }, 5000)
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
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading...</Text>
        </Stack>
      </Center>
    )
  }

  return (
    <AppShell
      navbar={{ width: 300, breakpoint: 'sm' }}
      header={{ height: 70 }}
      padding="md"
    >
      <AppShell.Navbar p="md">
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          memories={memories}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onClearMemories={clearMemories}
        />
      </AppShell.Navbar>

      <AppShell.Header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Group h="100%" px="md" justify="space-between">
          <Stack gap={0}>
            <Title order={3} style={{ color: 'white', fontWeight: 600 }}>
              {currentSession?.title || '🧠 Personal Data Wallet'}
            </Title>
            <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              ✨ Your decentralized memory layer powered by SUI & Walrus
            </Text>
          </Stack>

          <Group gap="md">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />

            <Badge 
              variant="gradient" 
              gradient={{ from: 'cyan', to: 'indigo' }}
              style={{ color: 'white' }}
            >
              🗃️ {memories.length} memories
            </Badge>

            <MemoryIndicator
              isProcessing={memoryIndicator.isProcessing}
              memoriesDetected={memoryIndicator.memoriesDetected}
              memoriesStored={memoryIndicator.memoriesStored}
              errors={memoryIndicator.errors}
              onViewDetails={openMemoryModal}
            />

            <Group gap="xs">
              <ActionIcon
                variant="gradient"
                gradient={{ from: 'cyan', to: 'indigo' }}
                onClick={openMemoryModal}
                title="Memory Manager"
                style={{ color: 'white' }}
              >
                <IconBrain size={16} />
              </ActionIcon>

              <Group gap="xs" style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '4px 8px', 
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <IconUser size={14} style={{ color: 'white' }} />
                <Text size="xs" ff="monospace" style={{ color: 'white' }}>
                  {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'User'}
                </Text>
              </Group>

              <ActionIcon
                variant="subtle"
                onClick={logout}
                title="Logout"
                style={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <IconLogout size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 70px)',
        background: 'linear-gradient(145deg, #f0f4f8 0%, #e2e8f0 100%)'
      }}>
        <ChatWindow
          messages={(() => {
            const sessionMessages = currentSession?.messages || []
            const allMessages = [...sessionMessages]
            
            console.log('Rendering messages:', {
              sessionMessages: sessionMessages.length,
              tempUserMessage: !!tempUserMessage,
              streamingMessage: !!streamingMessage,
              isRefreshingSession
            })
            
            // During session refresh, keep showing temporary messages to prevent flicker
            if (isRefreshingSession || tempUserMessage) {
              const isDuplicate = sessionMessages.some(msg => 
                msg.type === 'user' && 
                msg.content === tempUserMessage?.content &&
                Math.abs(new Date(msg.timestamp).getTime() - new Date(tempUserMessage?.timestamp || '').getTime()) < 15000 // Within 15 seconds
              )
              if (!isDuplicate && tempUserMessage) {
                allMessages.push(tempUserMessage)
              }
            }
            
            // Always show streaming message if active
            if (streamingMessage && (isStreaming || isRefreshingSession)) {
              allMessages.push(streamingMessage)
            }
            
            const sortedMessages = allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            console.log('Final message count:', sortedMessages.length)
            return sortedMessages
          })()}
          isLoading={isStreaming}
          streamingMessageId={streamingMessageId}
          streamingContent={currentResponse}
          userAddress={userAddress || ''}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isStreaming}
        />
      </AppShell.Main>

      {/* Memory Manager Modal */}
      <Modal
        opened={memoryModalOpened}
        onClose={closeMemoryModal}
        title="Memory Manager"
        size="lg"
      >
        <MemoryManager
          userAddress={userAddress || ''}
          onMemoryAdded={(memory) => {
            // Optionally refresh memories or update state
            console.log('Memory added:', memory)
          }}
          onMemoryDeleted={(memoryId) => {
            // Optionally refresh memories or update state
            console.log('Memory deleted:', memoryId)
          }}
        />
      </Modal>
    </AppShell>
  )
}