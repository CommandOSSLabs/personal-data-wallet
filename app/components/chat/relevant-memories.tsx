'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Group,
  Card,
  Badge,
  Collapse,
  ActionIcon,
  Stack,
  Loader,
  Center
} from '@mantine/core'
import {
  IconBrain,
  IconChevronDown,
  IconChevronRight,
  IconLockOpen,
  IconExternalLink
} from '@tabler/icons-react'
import { memoryApi } from '@/app/api/memoryApi'
import { MemoryDecryptionModal } from '../memory/memory-decryption-modal'

interface Memory {
  id: string
  content: string
  category: string
  timestamp: string
  similarity?: number
  isEncrypted: boolean
  walrusHash?: string
  owner: string
}

interface RelevantMemoriesProps {
  message: string
  userAddress: string
}

export function RelevantMemories({ message, userAddress }: RelevantMemoriesProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [decryptModalOpened, setDecryptModalOpened] = useState(false)

  useEffect(() => {
    if (!message || !userAddress) {
      setMemories([])
      setLoading(false)
      return
    }

    const fetchRelevantMemories = async () => {
      try {
        setLoading(true)
        const data = await memoryApi.searchMemories({
          query: message,
          userAddress,
          k: 3
        })
        
        // Filter out memories that were just created (within last 30 seconds)
        const now = Date.now();
        const relevantMemories = (data.results || [])
          // Only show high-quality matches
          .filter(memory => (memory.similarity || 0) > 0.70)
          // Skip recently created memories to prevent showing memories just created from the current message
          .filter(memory => {
            // If timestamp is available, filter out very recent memories
            if (memory.timestamp) {
              const timestamp = new Date(memory.timestamp).getTime();
              const timeDiff = now - timestamp;
              console.log(`Memory age: ${timeDiff}ms for "${memory.content?.substring(0, 20)}..."`);
              
              // Use a 30-second threshold to avoid showing memories from the current conversation
              return timeDiff > 30000; 
            }
            return true;
          })
          // Further filter to prevent showing memories that contain the exact message text
          .filter(memory => {
            if (!memory.content || !message) return true;
            
            // Check if memory content contains the exact message text
            // This helps prevent showing memories created from the current message
            const normalizedContent = memory.content.toLowerCase().trim();
            const normalizedMessage = message.toLowerCase().trim();
            
            // Don't show memories that are just the message or contain it exactly
            return !normalizedContent.includes(normalizedMessage) || 
                  (normalizedContent.length > normalizedMessage.length * 2);
          });
        
        setMemories(relevantMemories)
      } catch (error) {
        console.error('Failed to fetch relevant memories:', error)
        setMemories([])
      } finally {
        setLoading(false)
      }
    }

    fetchRelevantMemories()
  }, [message, userAddress])

  // If no relevant memories found, don't render anything
  if (!loading && memories.length === 0) {
    return null
  }

  const openDecryptModal = (memory: Memory) => {
    setSelectedMemory(memory)
    setDecryptModalOpened(true)
  }
  
  const openInSuiExplorer = (walrusHash: string) => {
    const explorerUrl = `https://suivision.xyz/object/${walrusHash}?network=testnet`
    window.open(explorerUrl, '_blank')
  }

  return (
    <Box mt={12} mb={4}>
      <Card p="sm" radius="md" withBorder style={{
        background: 'linear-gradient(to right, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
        borderColor: 'rgba(102, 126, 234, 0.2)',
      }}>
        <Group justify="space-between" mb={expanded ? "xs" : 0}>
          <Group gap="xs">
            <IconBrain size={16} color="var(--mantine-color-indigo-6)" />
            <Text size="sm" fw={500}>Related Memories</Text>
            <Badge size="xs" variant="light" color="indigo">{memories.length}</Badge>
          </Group>
          <ActionIcon 
            size="sm" 
            variant="subtle" 
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </ActionIcon>
        </Group>

        <Collapse in={expanded}>
          {loading ? (
            <Center py="sm">
              <Loader size="xs" />
            </Center>
          ) : (
            <Stack gap="xs">
              {memories.map((memory) => (
                <Card key={memory.id} p="xs" radius="sm" withBorder style={{ 
                  backgroundColor: 'white',
                }}>
                  <Group justify="space-between" mb="xs">
                    <Badge 
                      size="xs" 
                      variant="light" 
                      color={memory.similarity && memory.similarity > 0.8 ? "green" : "blue"}
                    >
                      {memory.similarity ? `${Math.round(memory.similarity * 100)}% match` : 'Related'}
                    </Badge>
                    <Badge size="xs" variant="outline">{memory.category}</Badge>
                  </Group>
                  
                  <Text size="xs" lineClamp={2}>{memory.content}</Text>
                  
                  <Group justify="flex-end" mt="xs" gap="xs">
                    {memory.walrusHash && (
                      <ActionIcon 
                        size="xs" 
                        variant="subtle" 
                        color="blue" 
                        onClick={() => openInSuiExplorer(memory.walrusHash!)}
                        title="View in Sui Explorer"
                      >
                        <IconExternalLink size={14} />
                      </ActionIcon>
                    )}
                    
                    {memory.isEncrypted && (
                      <ActionIcon 
                        size="xs" 
                        variant="subtle" 
                        color="teal" 
                        onClick={() => openDecryptModal(memory)}
                        title="Decrypt Memory"
                      >
                        <IconLockOpen size={14} />
                      </ActionIcon>
                    )}
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Collapse>
      </Card>

      {/* Decryption Modal */}
      {selectedMemory && (
        <MemoryDecryptionModal
          opened={decryptModalOpened}
          onClose={() => setDecryptModalOpened(false)}
          memory={selectedMemory}
          userAddress={userAddress}
        />
      )}
    </Box>
  )
}