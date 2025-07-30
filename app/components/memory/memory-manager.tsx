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
  Center
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
  IconCheck,
  IconX
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useDisclosure } from '@mantine/hooks'

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
  const [newMemoryContent, setNewMemoryContent] = useState('')
  const [newMemoryCategory, setNewMemoryCategory] = useState('general')
  const [addingMemory, setAddingMemory] = useState(false)

  // Search results
  const [searchResults, setSearchResults] = useState<Memory[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadMemories()
  }, [userAddress])

  const loadMemories = async () => {
    setLoading(true)
    try {
      // For now, use empty array since memory endpoints are not implemented yet
      // TODO: Implement memory endpoints in backend
      setMemories([])
    } catch (error) {
      console.error('Failed to load memories:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to load memories',
        color: 'red',
        icon: <IconX size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const addMemory = async () => {
    if (!newMemoryContent.trim()) return

    setAddingMemory(true)
    try {
      // For now, simulate adding memory since backend endpoints are not implemented yet
      // TODO: Implement memory endpoints in backend
      const newMemory: Memory = {
        id: `mem_${Date.now()}`,
        content: newMemoryContent,
        category: newMemoryCategory,
        timestamp: new Date().toISOString(),
        isEncrypted: true,
        owner: userAddress
      }

      setMemories(prev => [newMemory, ...prev])
      setNewMemoryContent('')
      setNewMemoryCategory('personal')
      closeAddModal()

      onMemoryAdded?.(newMemory)

      notifications.show({
        title: 'Added',
        message: 'Memory saved successfully',
        color: 'green',
        icon: <IconCheck size={16} />
      })

      if (response.ok) {
        const data = await response.json()
        const newMemory: Memory = {
          id: data.embeddingId,
          content: newMemoryContent,
          category: newMemoryCategory,
          timestamp: new Date().toISOString(),
          isEncrypted: true,
          walrusHash: data.walrusHash,
          owner: userAddress
        }

        setMemories(prev => [newMemory, ...prev])
        onMemoryAdded?.(newMemory)
        
        setNewMemoryContent('')
        setNewMemoryCategory('general')
        closeAddModal()

        notifications.show({
          title: 'Success',
          message: 'Memory saved securely',
          color: 'green',
          icon: <IconCheck size={16} />
        })
      } else {
        throw new Error('Failed to save memory')
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
      // For now, simulate search since backend endpoints are not implemented yet
      // TODO: Implement memory search endpoints in backend
      const filtered = memories.filter(memory =>
        memory.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory === 'all' || memory.category === selectedCategory)
      )
      setSearchResults(filtered)
    } catch (error) {
      console.error('Search failed:', error)
      notifications.show({
        title: 'Search Error',
        message: 'Failed to search memories',
        color: 'red',
        icon: <IconX size={16} />
      })
    } finally {
      setSearching(false)
    }
  }

  const deleteMemory = async (memoryId: string) => {
    try {
      // For now, simulate delete since backend endpoints are not implemented yet
      // TODO: Implement memory delete endpoints in backend
      setMemories(prev => prev.filter(m => m.id !== memoryId))
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

  const getCategoryColor = (category: string) => {
    return MEMORY_CATEGORIES.find(c => c.value === category)?.color || 'gray'
  }

  const filteredMemories = selectedCategory 
    ? memories.filter(m => m.category === selectedCategory)
    : memories

  const MemoryCard = ({ memory, showSimilarity = false }: { memory: Memory, showSimilarity?: boolean }) => (
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
              <Badge color="blue" variant="outline" size="xs">
                <IconLock size={10} />
              </Badge>
            )}
            {showSimilarity && memory.similarity && (
              <Badge color="green" variant="light" size="xs">
                {(memory.similarity * 100).toFixed(1)}% match
              </Badge>
            )}
          </Group>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => deleteMemory(memory.id)}
          >
            <IconTrash size={14} />
          </ActionIcon>
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
  )

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={600}>Memory Manager</Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openAddModal}
          >
            Add Memory
          </Button>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="browse" leftSection={<IconBrain size={16} />}>
              Browse
            </Tabs.Tab>
            <Tabs.Tab value="search" leftSection={<IconSearch size={16} />}>
              Search
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
    </>
  )
}
