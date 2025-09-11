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
import { MemorySelectionModal } from '@/app/components/memory/memory-selection-modal'
import { MemoryBatchStatus } from '@/app/components/memory/memory-batch-status'
import { MemoryExtraction } from '@/app/services/memoryIntegration'
import { emitMemoriesUpdated, emitMemoryAdded } from '@/app/services/memoryEventEmitter'
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
import { IconLogout, IconUser, IconBrain, IconWallet, IconShield } from '@tabler/icons-react'
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
  
  // Memory selection modal
  const [memorySelectionModalOpened, setMemorySelectionModalOpened] = useState(false)
  const [currentMemoryExtractions, setCurrentMemoryExtractions] = useState<MemoryExtraction[]>([])

  const { logout, userAddress } = useSuiAuth()

  const {
    sessions,
    currentSessionId,
    sessionsLoading,
    currentSessionLoading,
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
    console.log('🚀 handleSendMessage called with:', messageText);
    console.log('🚀 Current streaming state:', { isStreaming, currentSessionLoading });

    // Prevent sending if already processing
    if (isStreaming || currentSessionLoading) {
      console.log('❌ Blocked message send - already processing');
      return;
    }

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
        alert('Failed to create chat session. Please try again.')
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
            // Convert single extraction to array for consistency
            const extractions = Array.isArray(memoryExtraction) ? memoryExtraction : [memoryExtraction];
            const validExtractions = extractions.filter(ext => ext && ext.shouldSave);

            if (validExtractions.length > 0) {
              // Defer state updates to avoid setState during render
              setTimeout(() => {
                // Show memory indicator - detected but not yet stored
                memoryIndicator.setDetected(validExtractions.length);
                memoryIndicator.setStored(0);

                // Update temporary user message with memory detection data
                if (tempUserMessage) {
                  const updatedTempMessage: Message = {
                    ...tempUserMessage,
                    memoryDetected: true,
                    memoryExtraction: validExtractions[0] // Keep first for backward compatibility
                  };
                  setTempUserMessage(updatedTempMessage);
                }

                // Store memory extractions but delay showing modal
                console.log('Memories detected:', validExtractions);
                setCurrentMemoryExtractions(validExtractions);

                // Delay showing the memory modal until after the chat flow completes
                // This ensures the user sees their message and the AI response first
                setTimeout(() => {
                  // Only show modal if we're not in the middle of streaming/refreshing
                  if (!isStreaming && !isRefreshingSession) {
                    setMemorySelectionModalOpened(true);
                  } else {
                    // If still streaming, wait a bit more
                    setTimeout(() => {
                      setMemorySelectionModalOpened(true);
                    }, 2000);
                  }
                }, 1500); // 1.5 second delay to let the AI response complete
              }, 0);
            } else {
              setTimeout(() => {
                memoryIndicator.setDetected(0);
                memoryIndicator.setStored(0);
              }, 0);
            }
          } else {
            setTimeout(() => {
              memoryIndicator.setDetected(0);
              memoryIndicator.setStored(0);
            }, 0);
          }

          // Update the streaming message with the final content
          if (streamingMessage) {
            const finalMessage: Message = {
              ...streamingMessage,
              content: fullResponse
            }
            setStreamingMessage(finalMessage)
          }

            // Note: Messages are automatically saved by the backend streaming endpoint
            // No need to manually save them here to avoid duplicates
            console.log('Messages automatically saved by backend streaming endpoint')

          // Defer the session refresh to avoid setState during render
          setTimeout(async () => {
            setIsRefreshingSession(true)

            try {
              // Invalidate and refetch both session list and current session data
              await queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })
              await queryClient.invalidateQueries({ queryKey: ['chat-session', sessionId, userAddress] })
              await queryClient.refetchQueries({ queryKey: ['chat-sessions', userAddress] })
              await queryClient.refetchQueries({ queryKey: ['chat-session', sessionId, userAddress] })

              // Wait longer to ensure the backend data has been loaded and UI updated
              setTimeout(() => {
                setIsRefreshingSession(false)

                // Only clear temporary messages after confirming backend messages are loaded
                // AND memory modal is not open (to keep messages visible during memory selection)
                setTimeout(() => {
                  // Check if we have messages from the backend before clearing temp messages
                  const currentSession = getCurrentSession()
                  const hasBackendMessages = currentSession && currentSession.messages.length > 0

                  // Check if the user message specifically exists in backend messages
                  const userMessageExists = currentSession?.messages.some(msg =>
                    msg.type === 'user' &&
                    msg.content === tempUserMessage?.content &&
                    Math.abs(new Date(msg.timestamp).getTime() - new Date(tempUserMessage?.timestamp || '').getTime()) < 30000
                  )

                  if (hasBackendMessages && userMessageExists) {
                    console.log('Clearing temporary messages - user message found in backend:', userMessageExists)
                    setStreamingMessageId(null)
                    setStreamingMessage(null)
                    setTempUserMessage(null)
                  } else {
                    console.log('Keeping temporary messages - user message not yet in backend. HasBackend:', hasBackendMessages, 'UserExists:', userMessageExists)
                    // Retry clearing after another delay, but keep user message visible
                    setTimeout(() => {
                      // Check again if user message exists in backend
                      const currentSession = getCurrentSession()
                      const userMessageExists = currentSession?.messages.some(msg =>
                        msg.type === 'user' &&
                        msg.content === tempUserMessage?.content
                      )

                      if (userMessageExists) {
                        console.log('User message now found in backend, clearing temporary messages')
                        setStreamingMessageId(null)
                        setStreamingMessage(null)
                        setTempUserMessage(null)
                      } else {
                        // Keep user message visible but clear streaming
                        setStreamingMessageId(null)
                        setStreamingMessage(null)
                        console.log('User message still not in backend, keeping temporary user message visible')
                      }
                    }, 2000)
                  }
                }, 300) // Additional delay to ensure backend messages are displayed
              }, 800) // Increased delay to ensure query refetch completes
            } catch (error) {
              setIsRefreshingSession(false)

              // Keep temporary messages longer if refresh failed
              setTimeout(() => {
                setStreamingMessageId(null)
                setStreamingMessage(null)
                setTempUserMessage(null)
              }, 2000) // Longer delay for error case
            }
          }, 0)
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
            // Refresh session after saving error message (deferred to avoid render issues)
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })
              queryClient.invalidateQueries({ queryKey: ['chat-session', sessionId, userAddress] })
            }, 0)
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
        // Defer query invalidation to avoid render issues
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['chat-sessions', userAddress] })
          queryClient.invalidateQueries({ queryKey: ['chat-session', sessionId, userAddress] })
        }, 0)
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

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      // Call backend API to rename session
      const response = await fetch('/api/chat/sessions/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          title: newTitle,
          userAddress
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to rename session')
      }

      // Refresh sessions to show updated title
      // The useChatSessions hook will automatically refetch
      console.log(`Session ${sessionId} renamed to: ${newTitle}`)
    } catch (error) {
      console.error('Failed to rename session:', error)
      alert('Failed to rename session. Please try again.')
    }
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
          onRenameSession={handleRenameSession}
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

              <ActionIcon
                variant="gradient"
                gradient={{ from: 'orange', to: 'red' }}
                onClick={() => window.open('/permissions', '_blank')}
                title="Access Control & Permissions"
                style={{ color: 'white' }}
              >
                <IconShield size={16} />
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
            let allMessages = [...sessionMessages]

            // Debug logging
            if (process.env.NODE_ENV === 'development') {
              console.log('Message display state:', {
                sessionMessagesCount: sessionMessages.length,
                tempUserMessage: !!tempUserMessage,
                streamingMessage: !!streamingMessage,
                isStreaming,
                isRefreshingSession,
                currentSessionLoading
              })
            }

            // Add temporary messages during active states OR when memory modal is open OR when user message not yet in backend
            // This ensures user messages remain visible during memory selection and until saved to backend
            if (tempUserMessage && (isRefreshingSession || isStreaming || currentSessionLoading || memorySelectionModalOpened)) {
              const isDuplicate = sessionMessages.some(msg =>
                msg.type === 'user' &&
                msg.content === tempUserMessage?.content &&
                Math.abs(new Date(msg.timestamp).getTime() - new Date(tempUserMessage?.timestamp || '').getTime()) < 15000
              )

              if (!isDuplicate) {
                allMessages.push(tempUserMessage)
              }
            }

            // Add streaming message if active
            if (streamingMessage && (isStreaming || isRefreshingSession)) {
              // Check if streaming message is already in session messages
              const streamingDuplicate = sessionMessages.some(msg =>
                msg.id === streamingMessage.id ||
                (msg.type === 'assistant' &&
                 msg.content === streamingMessage.content &&
                 Math.abs(new Date(msg.timestamp).getTime() - new Date(streamingMessage.timestamp).getTime()) < 15000)
              )

              if (!streamingDuplicate) {
                allMessages.push(streamingMessage)
              }
            }

            // Remove duplicates by ID and content with more robust logic
            const uniqueMessages = allMessages.filter((message, index, array) => {
              // First occurrence wins
              const firstIndex = array.findIndex(m => {
                // Exact ID match
                if (m.id === message.id && message.id) return true

                // Content and type match (for messages without IDs or with generated IDs)
                if (m.content === message.content &&
                    m.type === message.type &&
                    message.content.trim() !== '') {
                  // Additional check: timestamps should be close (within 30 seconds)
                  const timeDiff = Math.abs(
                    new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()
                  )
                  return timeDiff < 30000 // 30 seconds
                }

                return false
              })

              return firstIndex === index
            })

            return uniqueMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          })()}
          isLoading={isStreaming}
          streamingMessageId={streamingMessageId}
          streamingContent={currentResponse}
          userAddress={userAddress || ''}
        />

        {/* Memory Batch Status */}
        {userAddress && (
          <div style={{ padding: '0 16px' }}>
            <MemoryBatchStatus
              userAddress={userAddress}
              onForceFlush={() => {
                // Refresh memory indicator after force flush
                memoryIndicator.setStored(memoryIndicator.memoriesStored);
              }}
            />
          </div>
        )}

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

      {/* Memory Selection Modal */}
      <MemorySelectionModal
        opened={memorySelectionModalOpened}
        onClose={() => {
          setMemorySelectionModalOpened(false);
          setCurrentMemoryExtractions([]);
          memoryIndicator.setDetected(0);

          // Clear temporary messages now that modal is closed
          // This ensures a clean chat interface after memory selection
          setTimeout(() => {
            setStreamingMessageId(null);
            setStreamingMessage(null);
            setTempUserMessage(null);
          }, 100);
        }}
        extractedMemories={currentMemoryExtractions}
        userAddress={userAddress || ''}
        onMemoriesSaved={(memoryIds) => {
          console.log('Memories saved with IDs:', memoryIds);
          memoryIndicator.setStored(memoryIds.length);

          // Emit events to notify other components
          emitMemoriesUpdated({ memoryIds, userAddress });
          memoryIds.forEach(memoryId => emitMemoryAdded(memoryId));

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

          // Close modal after successful save
          setMemorySelectionModalOpened(false);
          setCurrentMemoryExtractions([]);
        }}
        onError={(error) => {
          console.error('Memory save error:', error);
          // Keep modal open so user can retry
        }}
      />
    </AppShell>
  )
}