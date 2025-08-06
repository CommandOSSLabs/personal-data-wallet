'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ChatWindow } from './chat-window'
import { ChatInput } from './chat-input'
import { ModelSelector, ModelType } from './model-selector'
import { DEFAULT_MODEL_ID, getProviderModelId } from '@/app/config/models'
import { Sidebar } from '@/app/components/sidebar/sidebar'

import { useStreamingChat } from '@/app/hooks/use-streaming-chat'
import { useChatSessions } from '@/app/hooks/use-chat-sessions'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { Message } from '@/app/types'
import { memoryIntegrationService } from '@/app/services/memoryIntegration'
import { MemoryIndicator, useMemoryIndicator } from '@/app/components/memory/memory-indicator'
import { MemoryPanel } from '@/app/components/memory/memory-panel'
import { MemoryApprovalModal } from '@/app/components/memory/memory-approval-modal'
import { MemoryExtraction } from '@/app/services/memoryIntegration'
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
  Modal,
  Button
} from '@mantine/core'
import { IconLogout, IconUser, IconBrain, IconWallet } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { MemoryManager } from '@/app/components/memory/memory-manager'
import { WalletBalance } from '@/app/components/wallet/wallet-balance'

export function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState<ModelType>(DEFAULT_MODEL_ID)
  const queryClient = useQueryClient()

  // Memory indicator state
  const memoryIndicator = useMemoryIndicator()

  // Memory manager modal
  const [memoryModalOpened, { open: openMemoryModal, close: closeMemoryModal }] = useDisclosure(false)
  
  // Memory approval modal
  const [memoryApprovalModalOpened, setMemoryApprovalModalOpened] = useState(false)
  const [currentMemoryExtraction, setCurrentMemoryExtraction] = useState<MemoryExtraction | null>(null)

  const { logout, userAddress } = useSuiAuth()

  const {
    sessions,
    currentSessionId,
    sessionsLoading,
    getCurrentSession,
    createNewSession,
    addMessageToSession,
    deleteSession,
    selectSession,
    isAddingMessage,
    executePendingTransactions
  } = useChatSessions()

  // Load memories from the memory API
  const [memories, setMemories] = useState<any[]>([])
  const [memoriesLoading, setMemoriesLoading] = useState(true)
  const [currentInputMessage, setCurrentInputMessage] = useState<string>('')

  // Load memories when the user address changes
  useEffect(() => {
    const loadMemories = async () => {
      if (!userAddress) return
      
      try {
        setMemoriesLoading(true)
        const response = await memoryIntegrationService.fetchUserMemories(userAddress)
        setMemories(response.memories || [])
      } catch (error) {
        console.error('Failed to load memories:', error)
      } finally {
        setMemoriesLoading(false)
      }
    }
    
    loadMemories()
  }, [userAddress])

  const clearMemories = async () => {
    if (!userAddress) return
    
    try {
      await memoryIntegrationService.clearUserMemories(userAddress)
      setMemories([])
    } catch (error) {
      console.error('Failed to clear memories:', error)
    }
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
    // Ensure we have an active session
    let sessionId = currentSessionId
    if (!sessionId) {
      try {
        sessionId = await createNewSession()

        if (!sessionId) {
          alert('Failed to create chat session. Please try again.')
          return
        }
      } catch (error) {
        // Log error for monitoring but show a user-friendly message
        console.error('Failed to create session:', error instanceof Error ? error.message : 'Unknown error')
        
        // Check if it's a gas coin error
        if (error instanceof Error && error.message.includes('No valid gas coins found')) {
          alert('You need SUI tokens to pay for gas fees. Please get some SUI from the testnet faucet at https://suifaucet.com')
        } else if (error instanceof Error && error.message.includes('Insufficient SUI balance')) {
          alert('Insufficient SUI balance. Please get some SUI from the testnet faucet at https://suifaucet.com')
        } else {
          alert('Failed to create chat session. Please try again.')
        }
        return
      }
    }

    // Initialize memory indicator (backend now handles detection automatically)
    memoryIndicator.reset()
    memoryIndicator.startProcessing()

    // Create temporary user message for immediate display (will be replaced by backend data)
    // Use a more unique ID format combining timestamp and random string
    const timestamp = Date.now()
    const randomUserSuffix = Math.random().toString(36).substring(2, 8)
    const userMessageId = `${userAddress}_${timestamp}_${randomUserSuffix}`
    const tempUserMessage: Message = {
      id: userMessageId,
      content: messageText,
      type: 'user',
      timestamp: new Date().toISOString(),
    }

    // Create a placeholder message for streaming with a completely different ID
    const randomAiSuffix = Math.random().toString(36).substring(2, 8)
    const assistantMessageId = `${userAddress}_${timestamp + 1}_${randomAiSuffix}`
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
      const contextPromise = memoryIntegrationService.generateChatContext(
        messageText,
        currentSession?.messages?.map(m => `${m.type}: ${m.content}`) || [],
        userAddress!,
        userAddress! // Use wallet address as signature in production
      )

      // Set a 3-second timeout to avoid hanging the UI
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Memory context timeout')), 3000)
      )

      const contextResult = await Promise.race([contextPromise, timeoutPromise]) as any
      memoryContext = contextResult.fullContext || ''
    } catch (error) {
      // Silent fail - continue without memory context
      memoryContext = ''
    }

    try {
      // Send the user message and context separately to avoid double injection
      const streamingRequest = {
        text: messageText,
        userId: userAddress!,
        sessionId: sessionId,
        model: getProviderModelId(selectedModel),
        originalUserMessage: messageText,
        memoryContext: memoryContext
      }

      await sendStreamingMessage(
        streamingRequest,
        // On chunk received
        (_chunk: string) => {
          // The currentResponse is managed by the streaming hook
          // We don't need to manually update here as it's handled by the streaming state
        },
        // On complete
        async (fullResponse: string, intent?: string, entities?: any, memoryStored?: boolean, memoryId?: string, memoryExtraction?: any) => {
          // Handle memory extraction results from backend
          if (memoryExtraction && memoryExtraction.shouldSave) {
            // Show memory indicator - detected but not yet stored
            memoryIndicator.setDetected(1);
            memoryIndicator.setStored(0);
            
            // Update temporary user message with memory detection data
            if (tempUserMessage) {
              const updatedTempMessage: Message = {
                ...tempUserMessage,
                memoryDetected: true,
                memoryExtraction: memoryExtraction
              };
              setTempUserMessage(updatedTempMessage);
            }
            
            // Show memory approval modal to user
            console.log('Memory detected:', memoryExtraction);
            
            // Set current memory extraction and show modal
            setCurrentMemoryExtraction(memoryExtraction);
            setMemoryApprovalModalOpened(true);
          } else {
            memoryIndicator.setDetected(0);
            memoryIndicator.setStored(0);
          }

          // Update the streaming message with the final content
          if (streamingMessage) {
            const finalMessage: Message = {
              ...streamingMessage,
              content: fullResponse
            }
            setStreamingMessage(finalMessage)
          }

                      // Add both messages to blockchain transaction batch
            try {
              // Add user message to batch
              await addMessageToSession(
                sessionId,
                messageText,
                'user',
                false // Don't execute yet
              )
              
              // Add assistant response to batch
              await addMessageToSession(
                sessionId,
                fullResponse,
                'assistant',
                true // Execute the batch with both messages
              )
              
              console.log('Messages saved to blockchain successfully')
            } catch (error) {
              console.error('Error saving messages to blockchain:', error)
              // Continue even if blockchain save fails
            }

          // Refresh the session to get the latest messages
          setIsRefreshingSession(true)
          
          try {
            // Invalidate and refetch session data
            await queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })
            await queryClient.refetchQueries({ queryKey: ['chat-sessions', userAddress] })
            
            // Wait a moment to ensure the UI has updated with fresh data
            setTimeout(() => {
              setStreamingMessageId(null)
              setStreamingMessage(null)
              setTempUserMessage(null)
              setIsRefreshingSession(false)
            }, 100)
          } catch (error) {
            setIsRefreshingSession(false)
            
            // Keep temporary messages longer if refresh failed
            setTimeout(() => {
              setStreamingMessageId(null)
              setStreamingMessage(null)
              setTempUserMessage(null)
            }, 1000)
          }
        },
        // On error
        async (error: string) => {
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
            await queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })
          } catch (saveError) {
            // Silent error handling for production
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
        // Silent error handling for production
      }
      
      // Clear state after showing error
      setTimeout(() => {
        setStreamingMessageId(null)
        setStreamingMessage(null)
        setTempUserMessage(null)
      }, 5000)
    }
  }

  const handleNewChat = async () => {
    try {
      const sessionId = await createNewSession()
      if (!sessionId) {
        alert('Failed to create a new chat session. Please try again.')
      }
    } catch (error) {
      alert('Failed to create a new chat session. Please try again.')
    }
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
      aside={{ width: 320, breakpoint: 'md' }}
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
              ✨ Your decentralized memory layer with direct blockchain signing
            </Text>
          </Stack>

          <Group gap="md">
            <WalletBalance />
            
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
            
            // During session refresh, keep showing temporary messages to prevent flicker
            if (isRefreshingSession || tempUserMessage) {
              const isDuplicate = sessionMessages.some(msg => 
                msg.type === 'user' && 
                msg.content === tempUserMessage?.content &&
                Math.abs(new Date(msg.timestamp).getTime() - new Date(tempUserMessage?.timestamp || '').getTime()) < 15000 // Within 15 seconds
              )
              if (!isDuplicate && tempUserMessage) {
                allMessages.push(tempUserMessage)
              } else if (isDuplicate && tempUserMessage) {
                // If there's a duplicate from the backend, update the tempUserMessage with backend memory data
                const backendMessage = sessionMessages.find(msg => 
                  msg.type === 'user' && 
                  msg.content === tempUserMessage?.content &&
                  Math.abs(new Date(msg.timestamp).getTime() - new Date(tempUserMessage?.timestamp || '').getTime()) < 15000
                )
                // Use backend message data if available
              }
            }
            
            // Always show streaming message if active
            if (streamingMessage && (isStreaming || isRefreshingSession)) {
              allMessages.push(streamingMessage)
            }
            
            return allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          })()}
          isLoading={isStreaming}
          streamingMessageId={streamingMessageId}
          streamingContent={currentResponse}
          userAddress={userAddress || ''}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isStreaming}
          onInputChange={(text) => setCurrentInputMessage(text)}
        />
      </AppShell.Main>
      
      <AppShell.Aside>
        <MemoryPanel 
          userAddress={userAddress || ''}
          sessionId={currentSessionId || undefined}
          currentMessage={currentInputMessage}
        />
      </AppShell.Aside>

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

      {/* Memory Approval Modal */}
      {currentMemoryExtraction && (
        <MemoryApprovalModal
          opened={memoryApprovalModalOpened}
          onClose={() => {
            setMemoryApprovalModalOpened(false);
            setCurrentMemoryExtraction(null);
            memoryIndicator.setDetected(0);
          }}
          memoryExtraction={currentMemoryExtraction}
          userAddress={userAddress || ''}
          onApproved={(memoryId) => {
            console.log('Memory saved with ID:', memoryId);
            memoryIndicator.setStored(1);
            
            // Refresh memories list after save
            if (userAddress) {
              memoryIntegrationService.fetchUserMemories(userAddress)
                .then(response => {
                  setMemories(response.memories || []);
                })
                .catch(error => {
                  console.error('Error refreshing memories:', error);
                });
            }
          }}
          onRejected={() => {
            console.log('Memory save rejected by user');
            memoryIndicator.setDetected(0);
          }}
        />
      )}
    </AppShell>
  )
}