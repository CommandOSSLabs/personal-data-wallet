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

    // Process message for memory detection and storage (non-blocking, with full error isolation)
    const processMemoryAsync = async () => {
      try {
        memoryIndicator.reset()
        memoryIndicator.startProcessing()

        const memoryResult = await memoryIntegrationService.processMessage(
          messageText,
          userAddress!,
          undefined // TODO: Add user signature when available
        )

        memoryIndicator.setDetected(memoryResult.detectionResult.memories.length)
        memoryIndicator.setStored(memoryResult.storedMemories.length)

        if (memoryResult.storedMemories.length > 0) {
          console.log(`Stored ${memoryResult.storedMemories.length} memories:`, memoryResult.storedMemories)
        }

        if (memoryResult.errors.length > 0) {
          console.warn('Memory storage errors:', memoryResult.errors)
          memoryResult.errors.forEach(error => memoryIndicator.addError(error))
        }
      } catch (error) {
        console.error('Memory processing completely failed, but chat will continue:', error)
        memoryIndicator.addError('Memory system unavailable')
      }
    }

    // Start memory processing in background - completely isolated from chat flow
    processMemoryAsync().catch(error => {
      console.error('Memory processing promise rejected:', error)
    })

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
        async (fullResponse: string, intent?: string, entities?: any) => {
          console.log('Streaming complete:', { fullResponse, intent, entities })

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
          await queryClient.invalidateQueries({ queryKey: ['sui-chat-sessions', userAddress] })

          // Now clear the streaming state and temp user message after session is refreshed
          setTimeout(() => {
            setStreamingMessageId(null)
            setStreamingMessage(null)
            setTempUserMessage(null) // Clear temporary user message
          }, 1000) // Increased delay to ensure session is refreshed
        },
        // On error
        async (error: string) => {
          console.error('Streaming error:', error)
          setStreamingMessageId(null)
          setStreamingMessage(null)
          setTempUserMessage(null)
          
          const errorMessage: Message = {
            id: assistantMessageId,
            content: 'Sorry, there was an error processing your message. Please try again.',
            type: 'assistant',
            timestamp: new Date().toISOString(),
          }
          
          try {
            await addMessageToSession(sessionId, errorMessage.content, 'assistant')
          } catch (error) {
            console.error('Failed to save error message:', error)
          }
        }
      )

    } catch (error) {
      console.error('Failed to start streaming:', error)
      setStreamingMessageId(null)
      setStreamingMessage(null)
      setTempUserMessage(null)
      
      const errorMessage: Message = {
        id: assistantMessageId,
        content: 'Sorry, there was an error processing your message. Please try again.',
        type: 'assistant',
        timestamp: new Date().toISOString(),
      }

      try {
        await addMessageToSession(sessionId, errorMessage.content, 'assistant')
      } catch (error) {
        console.error('Failed to save error message:', error)
      }
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

      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Stack gap={0}>
            <Title order={3}>
              {currentSession?.title || 'Personal Data Wallet'}
            </Title>
            <Text size="sm" c="dimmed">
              Your decentralized memory layer
            </Text>
          </Stack>

          <Group gap="md">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />

            <Badge variant="light" color="blue">
              {memories.length} memories
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
                variant="subtle"
                color="blue"
                onClick={openMemoryModal}
                title="Memory Manager"
              >
                <IconBrain size={16} />
              </ActionIcon>

              <Group gap="xs">
                <IconUser size={16} />
                <Text size="xs" ff="monospace">
                  {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'User'}
                </Text>
              </Group>

              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={logout}
                title="Logout"
              >
                <IconLogout size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)' }}>
        <ChatWindow
          messages={[
            ...(currentSession?.messages || []),
            ...(tempUserMessage ? [tempUserMessage] : []),
            ...(streamingMessage ? [streamingMessage] : [])
          ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())}
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