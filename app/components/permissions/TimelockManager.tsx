'use client'

import React, { useState, useEffect } from 'react'
import {
  Stack,
  Paper,
  Title,
  Text,
  Button,
  TextInput,
  Textarea,
  Select,
  Group,
  Badge,
  Alert,
  Card,
  ActionIcon,
  Modal,
  Progress,
  Divider
} from '@mantine/core'
import { 
  IconClock, 
  IconPlus, 
  IconTrash, 
  IconLock, 
  IconLockOpen,
  IconCalendar,
  IconEye,
  IconX,
  IconCheck
} from '@tabler/icons-react'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { timelockService, type TimelockMemory } from '@/app/services/timelockService'

export function TimelockManager() {
  const { userAddress, isAuthenticated } = useSuiAuth()
  
  const [memories, setMemories] = useState<TimelockMemory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState<TimelockMemory | null>(null)
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null)
  
  // Form states
  const [newMemory, setNewMemory] = useState({
    name: '',
    description: '',
    content: '',
    unlockTime: '',
    suggestedTime: ''
  })

  // Load memories on mount and refresh every minute
  useEffect(() => {
    if (isAuthenticated && userAddress) {
      loadMemories()
      const interval = setInterval(loadMemories, 60000) // Refresh every minute
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, userAddress])

  const loadMemories = () => {
    if (!userAddress) return
    
    try {
      const userMemories = timelockService.getTimelockMemories(userAddress)
      setMemories(userMemories)
    } catch (error) {
      console.error('Failed to load time-lock memories:', error)
      setError('Failed to load time-locked memories')
    }
  }

  const handleCreateMemory = async () => {
    if (!userAddress || !newMemory.name.trim() || !newMemory.content.trim()) {
      setError('Name and content are required')
      return
    }

    let unlockTime: Date
    
    if (newMemory.suggestedTime) {
      // Use suggested time
      const suggested = timelockService.getSuggestedUnlockTimes()
        .find(t => t.label === newMemory.suggestedTime)
      if (!suggested) {
        setError('Invalid suggested time')
        return
      }
      unlockTime = suggested.value
    } else if (newMemory.unlockTime) {
      // Use custom time
      unlockTime = new Date(newMemory.unlockTime)
      if (isNaN(unlockTime.getTime())) {
        setError('Invalid unlock time format')
        return
      }
    } else {
      setError('Please select an unlock time')
      return
    }

    if (unlockTime.getTime() <= Date.now()) {
      setError('Unlock time must be in the future')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await timelockService.createTimelockMemory(
        newMemory.name,
        newMemory.description,
        newMemory.content,
        unlockTime,
        userAddress
      )

      // Reset form
      setNewMemory({
        name: '',
        description: '',
        content: '',
        unlockTime: '',
        suggestedTime: ''
      })
      setCreateModalOpen(false)
      loadMemories()
    } catch (error) {
      console.error('Failed to create time-lock memory:', error)
      setError(error instanceof Error ? error.message : 'Failed to create time-locked memory')
    } finally {
      setLoading(false)
    }
  }

  const handleViewMemory = async (memory: TimelockMemory) => {
    setSelectedMemory(memory)
    setDecryptedContent(null)
    setViewModalOpen(true)

    if (memory.canDecrypt && userAddress) {
      setLoading(true)
      try {
        const result = await timelockService.decryptTimelock({
          encryptedData: memory.encryptedData,
          userAddress
        })
        setDecryptedContent(result.content)
      } catch (error) {
        console.error('Failed to decrypt memory:', error)
        setError(error instanceof Error ? error.message : 'Failed to decrypt memory')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDeleteMemory = (memoryId: string) => {
    if (!userAddress || !confirm('Are you sure you want to delete this time-locked memory?')) return

    try {
      timelockService.deleteTimelockMemory(memoryId, userAddress)
      loadMemories()
    } catch (error) {
      console.error('Failed to delete memory:', error)
      setError('Failed to delete memory')
    }
  }

  const getStatusColor = (memory: TimelockMemory) => {
    return memory.canDecrypt ? 'green' : 'orange'
  }

  const getStatusIcon = (memory: TimelockMemory) => {
    return memory.canDecrypt ? <IconLockOpen size={14} /> : <IconLock size={14} />
  }

  if (!isAuthenticated) {
    return (
      <Alert color="blue" icon={<IconClock size={16} />}>
        Please connect your wallet to manage time-locked memories
      </Alert>
    )
  }

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <div>
            <Title order={3}>Time-locked Memories</Title>
            <Text size="sm" c="dimmed">
              Create memories that unlock at specific times
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpen(true)}
            loading={loading}
          >
            Create Time-lock
          </Button>
        </Group>

        {error && (
          <Alert color="red" icon={<IconX size={16} />} mb="md" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack gap="md">
          {memories.map((memory) => (
            <Card key={memory.id} withBorder>
              <Group justify="space-between" mb="sm">
                <div>
                  <Text fw={500}>{memory.name}</Text>
                  <Text size="sm" c="dimmed">{memory.description}</Text>
                </div>
                <Group gap="xs">
                  <Badge
                    color={getStatusColor(memory)}
                    variant="light"
                    leftSection={getStatusIcon(memory)}
                  >
                    {memory.canDecrypt ? 'Unlocked' : 'Locked'}
                  </Badge>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleViewMemory(memory)}
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDeleteMemory(memory.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>

              <Group justify="space-between" align="center">
                <div>
                  <Text size="xs" c="dimmed">
                    Unlocks: {new Date(memory.unlockTime).toLocaleString()}
                  </Text>
                  {!memory.canDecrypt && memory.timeRemaining && (
                    <Text size="xs" c="orange">
                      Time remaining: {timelockService.formatTimeRemaining(memory.timeRemaining)}
                    </Text>
                  )}
                </div>
                
                {!memory.canDecrypt && memory.timeRemaining && (
                  <Progress
                    value={Math.max(0, 100 - (memory.timeRemaining / (24 * 60 * 60 * 1000)) * 100)}
                    size="sm"
                    w={100}
                  />
                )}
              </Group>
            </Card>
          ))}

          {memories.length === 0 && (
            <Text ta="center" c="dimmed" py="xl">
              No time-locked memories created yet. Create your first time-lock to get started.
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Create Memory Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Time-locked Memory"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Memory Name"
            placeholder="Enter memory name"
            value={newMemory.name}
            onChange={(e) => setNewMemory(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <Textarea
            label="Description"
            placeholder="Describe this memory"
            value={newMemory.description}
            onChange={(e) => setNewMemory(prev => ({ ...prev, description: e.target.value }))}
          />

          <Textarea
            label="Content"
            placeholder="Enter the content to be time-locked"
            value={newMemory.content}
            onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
            minRows={3}
            required
          />

          <Divider label="Unlock Time" labelPosition="center" />

          <Select
            label="Quick Select"
            placeholder="Choose a suggested time"
            value={newMemory.suggestedTime}
            onChange={(value) => setNewMemory(prev => ({ 
              ...prev, 
              suggestedTime: value || '',
              unlockTime: value ? '' : prev.unlockTime 
            }))}
            data={timelockService.getSuggestedUnlockTimes().map(t => ({
              value: t.label,
              label: t.label
            }))}
            clearable
          />

          <Text ta="center" c="dimmed" size="sm">or</Text>

          <TextInput
            label="Custom Time"
            type="datetime-local"
            value={newMemory.unlockTime}
            onChange={(e) => setNewMemory(prev => ({ 
              ...prev, 
              unlockTime: e.target.value,
              suggestedTime: e.target.value ? '' : prev.suggestedTime
            }))}
            disabled={!!newMemory.suggestedTime}
          />

          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMemory} loading={loading}>
              Create Time-lock
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Memory Modal */}
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={selectedMemory?.name || 'Time-locked Memory'}
        size="md"
      >
        {selectedMemory && (
          <Stack gap="md">
            <div>
              <Text size="sm" c="dimmed" mb="xs">Description</Text>
              <Text>{selectedMemory.description || 'No description'}</Text>
            </div>

            <div>
              <Text size="sm" c="dimmed" mb="xs">Status</Text>
              <Badge
                color={getStatusColor(selectedMemory)}
                variant="light"
                leftSection={getStatusIcon(selectedMemory)}
              >
                {selectedMemory.canDecrypt ? 'Unlocked' : 'Locked'}
              </Badge>
            </div>

            <div>
              <Text size="sm" c="dimmed" mb="xs">Unlock Time</Text>
              <Text>{new Date(selectedMemory.unlockTime).toLocaleString()}</Text>
            </div>

            {!selectedMemory.canDecrypt && selectedMemory.timeRemaining && (
              <div>
                <Text size="sm" c="dimmed" mb="xs">Time Remaining</Text>
                <Text c="orange">
                  {timelockService.formatTimeRemaining(selectedMemory.timeRemaining)}
                </Text>
              </div>
            )}

            <Divider />

            <div>
              <Text size="sm" c="dimmed" mb="xs">Content</Text>
              {selectedMemory.canDecrypt ? (
                decryptedContent ? (
                  <Paper p="sm" bg="gray.0">
                    <Text style={{ whiteSpace: 'pre-wrap' }}>{decryptedContent}</Text>
                  </Paper>
                ) : (
                  <Text c="dimmed" fs="italic">Decrypting...</Text>
                )
              ) : (
                <Alert color="orange" icon={<IconLock size={16} />}>
                  Content is locked until unlock time
                </Alert>
              )}
            </div>
          </Stack>
        )}
      </Modal>
    </Stack>
  )
}
