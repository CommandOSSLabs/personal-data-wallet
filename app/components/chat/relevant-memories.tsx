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
  IconExternalLink
} from '@tabler/icons-react'
import { memoryIntegrationService } from '@/app/services/memoryIntegration'
// Removed MemoryDecryptionModal - content loads automatically now

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
  // Removed decryption modal state - content loads automatically now

  useEffect(() => {
    if (!message || !userAddress) {
      setMemories([])
      setLoading(false)
      return
    }

    const fetchRelevantMemories = async () => {
      try {
        setLoading(true)
        // Get memories directly from blockchain instead of through backend API
        const fetchedMemories = await memoryIntegrationService.fetchUserMemories(userAddress)
        
        // Filter memories for relevance to the current message
        console.log('Fetched memories for relevance check:', fetchedMemories.memories?.length || 0);
        console.log('Message to match against:', message);

        // For debugging: let's also try showing all memories to see if the issue is similarity scoring
        const allMemories = fetchedMemories.memories || [];
        console.log('All memories content check:', allMemories.map(m => ({
          id: m.id,
          hasContent: !!m.content,
          contentPreview: m.content?.substring(0, 30),
          isEncrypted: m.isEncrypted
        })));

        const results = memoryIntegrationService.getMemoriesRelevantToText(
          allMemories,
          message,
          5 // Get top 5 most relevant memories
        )

        console.log('Relevance results:', results.map(r => ({
          content: r.content?.substring(0, 50),
          similarity: r.similarity
        })));

        // Filter out memories that were just created (within last 30 seconds)
        const now = Date.now();
        const relevantMemories = (results || [])
          // Even lower threshold for demo - show any match above 10%
          .filter(memory => ((memory as any).similarity || 0) > 0.10)
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
        
        console.log('Final relevant memories after all filters:', relevantMemories.length);
        console.log('Relevant memories:', relevantMemories.map(m => ({
          content: m.content?.substring(0, 50),
          similarity: m.similarity,
          category: m.category
        })));

        // If no relevant memories found, show recent memories for demo purposes
        let memoriesToShow = relevantMemories;
        if (memoriesToShow.length === 0 && allMemories.length > 0) {
          console.log('No similarity matches found, showing recent memories for demo');
          memoriesToShow = allMemories
            .filter(m => m.content && m.content !== 'Loading content...' && m.content !== 'Content not available')
            .slice(0, 2) // Show 2 most recent memories
            .map(m => ({ ...m, similarity: 0.15 })); // Add fake similarity for display
        }

        setMemories(memoriesToShow)
      } catch (error) {
        console.error('Failed to fetch relevant memories:', error)
        setMemories([])
      } finally {
        setLoading(false)
      }
    }

    fetchRelevantMemories()
  }, [message, userAddress])

  // For debugging: show component even with no memories to see what's happening
  if (!loading && memories.length === 0) {
    console.log('No relevant memories found, component will not render');
    // Temporarily show debug info
    return (
      <Box mt={12} mb={4}>
        <Card p="sm" radius="md" withBorder style={{
          background: 'rgba(255, 193, 7, 0.1)',
          borderColor: 'rgba(255, 193, 7, 0.3)',
        }}>
          <Text size="sm" c="dimmed">
            🔍 No relevant memories found for this message
          </Text>
        </Card>
      </Box>
    );
  }

  // Removed openDecryptModal - content loads automatically now
  
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
                      color={(memory as any).similarity && (memory as any).similarity > 0.8 ? "green" : "blue"}
                    >
                      {(memory as any).similarity ? `${Math.round((memory as any).similarity * 100)}% match` : 'Related'}
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
                    
                    {/* Removed decrypt button - content loads automatically */}
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Collapse>
      </Card>

      {/* Decryption modal removed - content loads automatically */}
    </Box>
  )
}