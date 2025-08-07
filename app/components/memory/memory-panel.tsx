'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Stack,
  Text,
  Card,
  Group,
  Badge,
  Collapse,
  ActionIcon,
  Divider,
  ScrollArea,
  Loader,
  Center,
  Button
} from '@mantine/core'
import {
  IconBrain,
  IconChevronDown,
  IconChevronRight,
  IconPencil,
  IconExternalLink,
  IconCategory,
  IconLock,
  IconLockOpen,
  IconRefresh
} from '@tabler/icons-react'
import { memoryIntegrationService } from '@/app/services/memoryIntegration'
import { MemoryDecryptionModal } from './memory-decryption-modal'
import { memoryDecryptionCache } from '@/app/services/memoryDecryptionCache'
import { memoryEventEmitter } from '@/app/services/memoryEventEmitter'

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

interface MemoryPanelProps {
  userAddress: string
  sessionId?: string
  currentMessage?: string
}

export function MemoryPanel({ userAddress, sessionId, currentMessage }: MemoryPanelProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [relevantMemories, setRelevantMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedMemories, setExpandedMemories] = useState<Set<string>>(new Set())
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [decryptModalOpened, setDecryptModalOpened] = useState(false)
  const [decryptedMemories, setDecryptedMemories] = useState<Set<string>>(new Set())
  const [isBatchDecrypting, setIsBatchDecrypting] = useState(false)
  
  // Load all memories on component mount and auto-decrypt
  useEffect(() => {
    if (userAddress) {
      loadMemories();
    }
  }, [userAddress])

  // Add periodic refresh to catch new memories
  useEffect(() => {
    if (!userAddress) return;

    const refreshInterval = setInterval(() => {
      loadMemories();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(refreshInterval);
  }, [userAddress])

  // Add manual refresh function
  const refreshMemories = () => {
    if (userAddress) {
      loadMemories();
    }
  }

  // Listen for memory update events
  useEffect(() => {
    const handleMemoriesUpdated = () => {
      console.log('Memory panel: Received memories updated event');
      refreshMemories();
    }

    const handleMemoryAdded = (data: any) => {
      console.log('Memory panel: Received memory added event', data);
      refreshMemories();
    }

    // Subscribe to events
    memoryEventEmitter.on('memoriesUpdated', handleMemoriesUpdated);
    memoryEventEmitter.on('memoryAdded', handleMemoryAdded);

    // Cleanup on unmount
    return () => {
      memoryEventEmitter.off('memoriesUpdated', handleMemoriesUpdated);
      memoryEventEmitter.off('memoryAdded', handleMemoryAdded);
    }
  }, [userAddress])
  
  // Auto-decrypt newly loaded memories
  useEffect(() => {
    if (memories.length > 0) {
      // Auto-decrypt all memories
      handleDecryptAll(true); // silent mode
      
      // Auto-expand all memories by default
      const allMemoryIds = memories.map(memory => memory.id);
      setExpandedMemories(new Set(allMemoryIds));
    }
  }, [memories])
  
  // Find relevant memories when current message changes
  useEffect(() => {
    if (currentMessage && currentMessage.trim().length > 0) {
      findRelevantMemories(currentMessage)
    } else {
      setRelevantMemories([])
    }
  }, [currentMessage])
  
  // Sync with decryption cache
  useEffect(() => {
    // For each memory, check if it's already in the cache
    const syncWithCache = async () => {
      if (memories.length === 0) return;
      
      const newDecrypted = new Set(decryptedMemories);
      let hasChanges = false;
      
      // Check each encrypted memory
      for (const memory of memories) {
        if (memory.isEncrypted && !decryptedMemories.has(memory.id)) {
          // Check if this memory is already decrypted in cache
          if (await memoryDecryptionCache.isMemoryDecrypted(memory.id)) {
            newDecrypted.add(memory.id);
            hasChanges = true;
          }
        }
      }
      
      // Update state if we found any cached memories
      if (hasChanges) {
        setDecryptedMemories(newDecrypted);
      }
    };
    
    syncWithCache();
  }, [memories, decryptedMemories])
  
  const loadMemories = async () => {
    if (!userAddress) return
    
    setLoading(true)
    try {
      // Get memories directly from blockchain using the integration service
      const data = await memoryIntegrationService.fetchUserMemories(userAddress)
      
      const memoryList = data.memories || []
      setMemories(memoryList)
    } catch (error) {
      console.error('Failed to load memories:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const findRelevantMemories = async (query: string) => {
    if (!query || !userAddress) return
    
    try {
      // First get all memories
      const allMemories = await memoryIntegrationService.fetchUserMemories(userAddress)
      
      // Then filter for relevance using the client-side search
      const relevantList = memoryIntegrationService.getMemoriesRelevantToText(
        allMemories.memories || [],
        query,
        5 // Limit to 5 results
      )
      
      setRelevantMemories(relevantList)
    } catch (error) {
      console.error('Failed to find relevant memories:', error)
    }
  }
  
  const toggleMemory = (memoryId: string) => {
    const newExpanded = new Set(expandedMemories)
    if (newExpanded.has(memoryId)) {
      newExpanded.delete(memoryId)
    } else {
      newExpanded.add(memoryId)
    }
    setExpandedMemories(newExpanded)
  }
  
  const openDecryptModal = (memory: Memory) => {
    setSelectedMemory(memory)
    setDecryptModalOpened(true)
  }
  
  const handleDecryptAll = async (silent: boolean = false) => {
    if (!userAddress || memories.length === 0) return
    
    if (!silent) setIsBatchDecrypting(true)
    try {
      // Get all encrypted memories that aren't already decrypted
      const encryptedMemories = memories.filter(
        memory => memory.isEncrypted && !decryptedMemories.has(memory.id)
      );
      
      if (encryptedMemories.length === 0) {
        if (!silent) {
          console.log('No encrypted memories to decrypt');
        }
        if (!silent) setIsBatchDecrypting(false);
        return;
      }
      
      // Process in batches to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < encryptedMemories.length; i += batchSize) {
        const batch = encryptedMemories.slice(i, i + batchSize);
        await Promise.all(batch.map(async (memory) => {
          try {
            if (memory.walrusHash) {
              // Use the cache service to get and store content
              const content = await memoryDecryptionCache.getDecryptedContent(memory.walrusHash);
              if (content) {
                // Mark as decrypted both in our state and the cache
                memoryDecryptionCache.markMemoryDecrypted(memory.id);
                setDecryptedMemories(prev => {
                  const newSet = new Set(prev);
                  newSet.add(memory.id);
                  return newSet;
                });
                
                if (!silent) {
                  console.log(`Decrypted memory ${memory.id.slice(0, 8)}...`);
                }
              }
            }
          } catch (err) {
            console.error(`Failed to decrypt memory ${memory.id}:`, err);
          }
        }));
      }
      
      if (!silent) {
        console.log(`Successfully decrypted ${encryptedMemories.length} memories`);
      }
    } catch (error) {
      console.error('Failed to decrypt all memories:', error);
    } finally {
      if (!silent) setIsBatchDecrypting(false);
    }
  }
  
  const getCategoryColor = (category: string) => {
    const categories: Record<string, string> = {
      'personal': 'blue',
      'work': 'green',
      'preferences': 'pink',
      'skills': 'violet',
      'auto-detected': 'cyan',
      'general': 'gray'
    }
    return categories[category] || 'gray'
  }
  
  const openInSuiExplorer = (walrusHash: string) => {
    const explorerUrl = `https://suivision.xyz/object/${walrusHash}?network=testnet`
    window.open(explorerUrl, '_blank')
  }
  
  const renderMemoryCard = (memory: Memory, isRelevant: boolean = false) => (
    <Card key={memory.id} withBorder mb="xs" p="sm">
      <Stack gap="xs">
        <Group justify="space-between">
          <Badge color={getCategoryColor(memory.category)} size="sm" variant="light">
            {memory.category}
          </Badge>
          
          <Group gap="xs">
            {isRelevant && memory.similarity && (
              <Badge color="green" size="sm" variant="light">
                {(memory.similarity * 100).toFixed(0)}% match
              </Badge>
            )}
            
            <ActionIcon 
              size="sm" 
              variant="subtle" 
              onClick={() => toggleMemory(memory.id)}
              aria-label="Expand memory"
            >
              {expandedMemories.has(memory.id) ? 
                <IconChevronDown size={16} /> : 
                <IconChevronRight size={16} />}
            </ActionIcon>
          </Group>
        </Group>
        
        <Text size="sm" lineClamp={expandedMemories.has(memory.id) ? undefined : 2}>
          {memory.content}
        </Text>
        
        <Collapse in={expandedMemories.has(memory.id)}>
          <Group mt="xs" justify="space-between">
            <Text size="xs" c="dimmed">
              {new Date(memory.timestamp).toLocaleString()}
            </Text>
            
            <Group gap="xs">
              {memory.walrusHash && (
                <ActionIcon 
                  size="xs" 
                  variant="subtle" 
                  color="blue" 
                  onClick={() => openInSuiExplorer(memory.walrusHash!)}
                  title="View in Explorer"
                >
                  <IconExternalLink size={14} />
                </ActionIcon>
              )}
              
              {memory.isEncrypted && (
                <ActionIcon 
                  size="xs" 
                  variant={decryptedMemories.has(memory.id) ? "filled" : "subtle"}
                  color={decryptedMemories.has(memory.id) ? "teal" : "gray"}
                  onClick={() => openDecryptModal(memory)}
                  title={decryptedMemories.has(memory.id) ? "View Decrypted Memory" : "Decrypt Memory"}
                >
                  {decryptedMemories.has(memory.id) ? (
                    <IconLockOpen size={14} />
                  ) : (
                    <IconLock size={14} />
                  )}
                </ActionIcon>
              )}
              
              <ActionIcon 
                size="xs" 
                variant="subtle"
                title="Edit Memory"
              >
                <IconPencil size={14} />
              </ActionIcon>
            </Group>
          </Group>
        </Collapse>
      </Stack>
    </Card>
  )
  
  return (
    <Box 
      style={{
        borderLeft: '1px solid var(--mantine-color-gray-3)',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group justify="space-between">
          <Group>
            <IconBrain size={18} />
            <Text fw={600}>Memory Panel</Text>
            <Badge size="xs" variant="light">
              {memories.length}
            </Badge>
          </Group>
          <ActionIcon
            variant="light"
            size="sm"
            onClick={refreshMemories}
            title="Refresh memories"
          >
            <IconRefresh size={14} />
          </ActionIcon>
        </Group>
      </Box>
      
      <ScrollArea style={{ flex: 1 }}>
        <Box p="md">
          {loading ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : (
            <>
              {relevantMemories.length > 0 && (
                <>
                  <Text size="sm" fw={500} mb="xs">Relevant Memories</Text>
                  {relevantMemories.map(memory => renderMemoryCard(memory, true))}
                  <Divider my="md" />
                </>
              )}
              
              <Text size="sm" fw={500} mb="xs">Recent Memories</Text>
              {memories.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  No memories stored yet. Start chatting to collect memories.
                </Text>
              ) : (
                memories.slice(0, 5).map(memory => renderMemoryCard(memory))
              )}
            </>
          )}
        </Box>
      </ScrollArea>
      
      {/* Memory Stats */}
      <Box p="md" bg="gray.0" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
        <Group justify="space-between" mb="xs">
          <Text size="xs" fw={500}>Memory Stats</Text>
          <Group gap="xs">
            <Button 
              variant="light" 
              size="xs" 
              leftSection={<IconLockOpen size={12} />}
              onClick={handleDecryptAll}
              loading={isBatchDecrypting}
              disabled={memories.filter(m => m.isEncrypted && !decryptedMemories.has(m.id)).length === 0}
            >
              Decrypt All
            </Button>
            <Button 
              variant="subtle" 
              size="xs" 
              rightSection={<IconExternalLink size={12} />}
              component="a"
              href="/memory-manager"
            >
              Memory Manager
            </Button>
          </Group>
        </Group>
        
        <Group grow>
          <Stack align="center" gap={0}>
            <Text size="sm" fw={600}>{memories.length}</Text>
            <Text size="xs" c="dimmed">Total</Text>
          </Stack>
          <Stack align="center" gap={0}>
            <Text size="sm" fw={600}>
              {Object.keys(memories.reduce((acc, m) => ({...acc, [m.category]: true}), {})).length}
            </Text>
            <Text size="xs" c="dimmed">Categories</Text>
          </Stack>
          <Stack align="center" gap={0}>
            <Text size="sm" fw={600}>
              {memories.filter(m => m.isEncrypted).length}
            </Text>
            <Text size="xs" c="dimmed">Encrypted</Text>
          </Stack>
        </Group>
      </Box>
      
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