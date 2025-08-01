'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Text,
  Badge,
  Card,
  ActionIcon,
  Tabs,
  ScrollArea,
  Alert,
  Loader,
  Center,
  Progress,
  Tooltip,
  Box
} from '@mantine/core'
import {
  IconPlus,
  IconSearch,
  IconBrain,
  IconTrash,
  IconEdit,
  IconCategory,
  IconClock,
  IconLock,
  IconLockOpen,
  IconCheck,
  IconX,
  IconBolt
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useDisclosure } from '@mantine/hooks'
import { memoryApi } from '@/app/api/memoryApi'
import { MemoryGraph } from './memory-graph'
import { MemoryDecryptionModal } from './memory-decryption-modal'
import { memoryDecryptionCache } from '@/app/services/memoryDecryptionCache'

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

interface MemoryManagerProps {
  userAddress: string
  onMemoryAdded?: (memory: Memory) => void
  onMemoryDeleted?: (memoryId: string) => void
}

const MEMORY_CATEGORIES = [
  { value: 'personal', label: 'Personal', color: 'blue' },
  { value: 'work', label: 'Work', color: 'green' },
  { value: 'facts', label: 'Facts & Knowledge', color: 'orange' },
  { value: 'schedule', label: 'Schedule & Events', color: 'purple' },
  { value: 'preferences', label: 'Preferences', color: 'pink' },
  { value: 'goals', label: 'Goals & Plans', color: 'teal' },
  { value: 'general', label: 'General', color: 'gray' }
]

export function MemoryManager({ userAddress, onMemoryAdded, onMemoryDeleted }: MemoryManagerProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('browse')
  
  // Add memory modal
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false)
  const [decryptModalOpened, { open: openDecryptModal, close: closeDecryptModal }] = useDisclosure(false)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [newMemoryContent, setNewMemoryContent] = useState('')
  const [newMemoryCategory, setNewMemoryCategory] = useState('general')
  const [addingMemory, setAddingMemory] = useState(false)
  
  // Batch decryption state
  const [isDecryptingAll, setIsDecryptingAll] = useState(false)
  const [decryptProgress, setDecryptProgress] = useState(0)
  const [decryptedMemories, setDecryptedMemories] = useState<Set<string>>(new Set())

  // Search results
  const [searchResults, setSearchResults] = useState<Memory[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadMemories()
  }, [userAddress])

  const loadMemories = async () => {
    setLoading(true)
    try {
      // Use empty query to get all memories for the user
      const data = await memoryApi.searchMemories({
        query: '',
        userAddress,
        k: 50
      })
      console.log('Memory API response:', data)
      
      // Handle different response formats
      const memoryList = data.results || []
      console.log('Processed memories:', memoryList)
      setMemories(memoryList)
      
      if (memoryList.length === 0) {
        console.log('No memories found for user:', userAddress)
      }
    } catch (error: any) {
      console.error('Failed to load memories:', error)
      
      // More detailed error handling
      let errorMessage = 'Failed to load memories';
      if (error?.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The server might be under heavy load.';
      } else if (error?.response) {
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error?.request) {
        errorMessage = 'No response from server. Check your connection.';
      }
      
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
        icon: <IconX size={16} />,
        autoClose: 5000
      })
      setMemories([])
      
      // Retry once with smaller batch size on timeout
      if (error?.code === 'ECONNABORTED') {
        try {
          const retryData = await memoryApi.searchMemories({
            query: '',
            userAddress,
            k: 20 // Smaller batch
          });
          const retryMemoryList = retryData.results || [];
          if (retryMemoryList.length > 0) {
            setMemories(retryMemoryList);
            notifications.show({
              title: 'Partial Recovery',
              message: 'Loaded some memories with reduced batch size',
              color: 'yellow',
              autoClose: 3000
            });
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const addMemory = async () => {
    if (!newMemoryContent.trim()) return

    setAddingMemory(true)
    try {
      const data = await memoryApi.createMemory({
        content: newMemoryContent,
        userAddress: userAddress,
        category: newMemoryCategory
      })
      
      // Refresh the memories list
      await loadMemories()
      
      setNewMemoryContent('')
      setNewMemoryCategory('general')
      closeAddModal()

      notifications.show({
        title: 'Memory Added',
        message: `Memory saved successfully! ID: ${data.embeddingId?.slice(0, 8)}...`,
        color: 'green',
        icon: <IconCheck size={16} />
      })

      if (onMemoryAdded && data.success && data.embeddingId) {
        // Create a Memory object from the response data
        const newMemory: Memory = {
          id: data.embeddingId,
          content: newMemoryContent,
          category: newMemoryCategory,
          timestamp: new Date().toISOString(),
          isEncrypted: true,
          owner: userAddress
        };
        onMemoryAdded(newMemory);
      }
    } catch (error) {
      console.error('Failed to add memory:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to save memory',
        color: 'red',
        icon: <IconX size={16} />
      })
    } finally {
      setAddingMemory(false)
    }
  }

  const searchMemories = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const data = await memoryApi.searchMemories({
        query: searchQuery,
        userAddress,
        category: selectedCategory || undefined,
        k: 20
      })
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Search failed:', error)
      notifications.show({
        title: 'Search Error',
        message: 'Failed to search memories',
        color: 'red',
        icon: <IconX size={16} />
      })
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const deleteMemory = async (memoryId: string) => {
    try {
      await memoryApi.deleteMemory(memoryId, userAddress)
      
      // Refresh the memories list
      await loadMemories()
      
      // Also remove from search results if present
      setSearchResults(prev => prev.filter(m => m.id !== memoryId))
      onMemoryDeleted?.(memoryId)

      notifications.show({
        title: 'Deleted',
        message: 'Memory removed',
        color: 'blue',
        icon: <IconCheck size={16} />
      })
    } catch (error) {
      console.error('Failed to delete memory:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to delete memory',
        color: 'red',
        icon: <IconX size={16} />
      })
    }
  }
  
  const decryptAllMemories = async () => {
    if (isDecryptingAll || memories.length === 0) return;
    
    setIsDecryptingAll(true);
    setDecryptProgress(0);
    
    try {
      const encryptedMemories = memories.filter(m => 
        m.isEncrypted && !decryptedMemories.has(m.id) && m.walrusHash
      );
      
      if (encryptedMemories.length === 0) {
        notifications.show({
          title: 'No Encrypted Memories',
          message: 'There are no encrypted memories to decrypt.',
          color: 'blue'
        });
        setIsDecryptingAll(false);
        return;
      }
      
      // Process in small batches to avoid overwhelming the API
      const batchSize = 3;
      const totalMemories = encryptedMemories.length;
      let processedCount = 0;
      
      // Update progress tracking
      const updateProgress = () => {
        processedCount++;
        setDecryptProgress(Math.floor((processedCount / totalMemories) * 100));
      };
      
      for (let i = 0; i < encryptedMemories.length; i += batchSize) {
        const batch = encryptedMemories.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async memory => {
          try {
            if (memory.walrusHash) {
              // Use our caching service for decryption
              const content = await memoryDecryptionCache.getDecryptedContent(memory.walrusHash);
              if (content) {
                // Add to our decrypted set
                setDecryptedMemories(prev => {
                  const newSet = new Set(prev);
                  newSet.add(memory.id);
                  return newSet;
                });
                // Also mark in the cache
                memoryDecryptionCache.markMemoryDecrypted(memory.id);
              }
            }
          } catch (err) {
            console.error(`Failed to decrypt memory ${memory.id}:`, err);
          } finally {
            updateProgress();
          }
        }));
      }
      
      notifications.show({
        title: 'Decryption Complete',
        message: `Successfully decrypted ${processedCount} memories.`,
        color: 'green',
        icon: <IconLockOpen size={16} />
      });
      
    } catch (error) {
      console.error('Failed to decrypt all memories:', error);
      notifications.show({
        title: 'Decryption Failed',
        message: 'An error occurred while decrypting memories.',
        color: 'red'
      });
    } finally {
      setIsDecryptingAll(false);
    }
  }

  const getCategoryColor = (category: string) => {
    return MEMORY_CATEGORIES.find(c => c.value === category)?.color || 'gray'
  }

  const filteredMemories = selectedCategory 
    ? memories.filter(m => m.category === selectedCategory)
    : memories

  const MemoryCard = ({ memory, showSimilarity = false }: { memory: Memory, showSimilarity?: boolean }) => {
    // Function to open Sui Explorer in new tab
    const openInSuiExplorer = (walrusHash: string) => {
      // Use SuiVision explorer which better handles Walrus hashes
      const explorerUrl = `https://suivision.xyz/object/${walrusHash}?network=testnet`; 
      window.open(explorerUrl, '_blank');
    };
    
    return (
      <Card key={memory.id} p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start">
            <Group gap="xs">
              <Badge 
                color={getCategoryColor(memory.category)} 
                variant="light"
                leftSection={<IconCategory size={12} />}
              >
                {MEMORY_CATEGORIES.find(c => c.value === memory.category)?.label || memory.category}
              </Badge>
              {memory.isEncrypted && (
                <Badge 
                  color={decryptedMemories.has(memory.id) ? "teal" : "blue"}
                  variant={decryptedMemories.has(memory.id) ? "filled" : "outline"}
                  size="xs"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedMemory(memory)
                    openDecryptModal()
                  }}
                >
                  {decryptedMemories.has(memory.id) ? 
                    <><IconLockOpen size={10} /> Decrypted</> : 
                    <><IconLock size={10} /> Encrypted</>}
                </Badge>
              )}
              {showSimilarity && memory.similarity && (
                <Badge color="green" variant="light" size="xs">
                  {(memory.similarity * 100).toFixed(1)}% match
                </Badge>
              )}
            </Group>
            <Group gap="xs">
              {memory.walrusHash && (
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  size="sm"
                  title="View on Sui Explorer"
                  onClick={() => openInSuiExplorer(memory.walrusHash || '')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor"/>
                    <path d="M12 10.5C12.83 10.5 13.5 11.17 13.5 12C13.5 12.83 12.83 13.5 12 13.5C11.17 13.5 10.5 12.83 10.5 12C10.5 11.17 11.17 10.5 12 10.5Z" fill="currentColor"/>
                    <path d="M7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12ZM9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12Z" fill="currentColor"/>
                  </svg>
                </ActionIcon>
              )}
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => deleteMemory(memory.id)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          </Group>
          
          <Text size="sm" lineClamp={3}>
            {memory.content}
          </Text>
          
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconClock size={12} />
              <Text size="xs" c="dimmed">
                {new Date(memory.timestamp).toLocaleDateString()}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" ff="monospace">
              {memory.id.slice(0, 8)}...
            </Text>
          </Group>
        </Stack>
      </Card>
    );
  }


  return (
    <>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={600}>Memory Manager</Text>
          
          <Group gap="sm">
            <Tooltip label="Decrypt all memories at once">
              <Button
                leftSection={isDecryptingAll ? <Loader size={14} /> : <IconBolt size={16} />}
                variant="light"
                color="teal"
                onClick={decryptAllMemories}
                disabled={isDecryptingAll || memories.length === 0}
              >
                Decrypt All
              </Button>
            </Tooltip>
            
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openAddModal}
            >
              Add Memory
            </Button>
          </Group>
        </Group>
        
        {isDecryptingAll && (
          <Box style={{ position: 'relative' }} mb="xs">
            <Progress 
              value={decryptProgress} 
              size="sm" 
              color="teal"
              striped
              animated
            />
            <Text
              size="xs"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {decryptProgress}% Complete
            </Text>
          </Box>
        )}

        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'browse')}>
          <Tabs.List>
            <Tabs.Tab value="browse" leftSection={<IconBrain size={16} />}>
              Browse
            </Tabs.Tab>
            <Tabs.Tab value="search" leftSection={<IconSearch size={16} />}>
              Search
            </Tabs.Tab>
            <Tabs.Tab value="graph" leftSection={<IconCategory size={16} />}>
              Graph
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="browse" pt="md">
            <Stack gap="md">
              <Select
                placeholder="Filter by category"
                data={[
                  { value: '', label: 'All Categories' },
                  ...MEMORY_CATEGORIES.map(c => ({ value: c.value, label: c.label }))
                ]}
                value={selectedCategory || ''}
                onChange={(value) => setSelectedCategory(value || null)}
                clearable
              />

              {loading ? (
                <Center py="xl">
                  <Stack align="center" gap="sm">
                    <Loader />
                    <Text c="dimmed">Loading memories...</Text>
                  </Stack>
                </Center>
              ) : filteredMemories.length === 0 ? (
                <Alert color="blue" title="No memories found">
                  {selectedCategory 
                    ? `No memories in the ${selectedCategory} category yet.`
                    : 'No memories saved yet. Add your first memory to get started!'
                  }
                </Alert>
              ) : (
                <ScrollArea h={400}>
                  <Stack gap="sm">
                    {filteredMemories.map(memory => (
                      <MemoryCard key={memory.id} memory={memory} />
                    ))}
                  </Stack>
                </ScrollArea>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="search" pt="md">
            <Stack gap="md">
              <Group>
                <TextInput
                  placeholder="Search your memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1 }}
                  onKeyDown={(e) => e.key === 'Enter' && searchMemories()}
                />
                <Button
                  onClick={searchMemories}
                  loading={searching}
                  leftSection={<IconSearch size={16} />}
                >
                  Search
                </Button>
              </Group>

              <Select
                placeholder="Filter by category"
                data={[
                  { value: '', label: 'All Categories' },
                  ...MEMORY_CATEGORIES.map(c => ({ value: c.value, label: c.label }))
                ]}
                value={selectedCategory || ''}
                onChange={(value) => setSelectedCategory(value || null)}
                clearable
              />

              {searchResults.length === 0 && searchQuery ? (
                <Alert color="yellow" title="No results">
                  No memories found matching your search query.
                </Alert>
              ) : (
                <ScrollArea h={400}>
                  <Stack gap="sm">
                    {searchResults.map(memory => (
                      <MemoryCard key={memory.id} memory={memory} showSimilarity />
                    ))}
                  </Stack>
                </ScrollArea>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="graph" pt="md">
            <MemoryGraph memories={memories} userAddress={userAddress} />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Add Memory Modal */}
      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title="Add New Memory"
        size="md"
      >
        <Stack gap="md">
          <Textarea
            label="Memory Content"
            placeholder="What would you like to remember?"
            value={newMemoryContent}
            onChange={(e) => setNewMemoryContent(e.target.value)}
            minRows={4}
            maxRows={8}
            required
          />

          <Select
            label="Category"
            data={MEMORY_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
            value={newMemoryCategory}
            onChange={(value) => setNewMemoryCategory(value || 'general')}
            required
          />

          <Alert color="blue" title="Secure Storage">
            Your memory will be encrypted and stored securely on the decentralized network.
          </Alert>

          <Group justify="flex-end">
            <Button variant="outline" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button
              onClick={addMemory}
              loading={addingMemory}
              disabled={!newMemoryContent.trim()}
              leftSection={<IconCheck size={16} />}
            >
              Save Memory
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Memory Decryption Modal */}
      {selectedMemory && (
        <MemoryDecryptionModal
          opened={decryptModalOpened}
          onClose={closeDecryptModal}
          memory={selectedMemory}
          userAddress={userAddress}
        />
      )}
    </>
  )
}
