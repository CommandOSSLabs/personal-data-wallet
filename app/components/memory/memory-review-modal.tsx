'use client'

import { useState, useEffect } from 'react'
import { 
  Modal, 
  Text, 
  Button, 
  Textarea, 
  Select, 
  Group, 
  Stack, 
  Paper,
  Badge,
  Loader,
  Alert
} from '@mantine/core'
import { IconBrain, IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { memoryApi } from '../../api/memoryApi'

interface MemoryReviewModalProps {
  opened: boolean
  onClose: () => void
  messageContent: string
  messageId?: string
  memoryId?: string | null
  userAddress: string
}

export function MemoryReviewModal({
  opened,
  onClose,
  messageContent,
  messageId,
  memoryId,
  userAddress
}: MemoryReviewModalProps) {
  const [extractedMemory, setExtractedMemory] = useState('')
  const [category, setCategory] = useState<string>('personal')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Extract potential memory from message content when modal opens
  useEffect(() => {
    if (opened && messageContent && !memoryId) {
      setExtractedMemory(messageContent)
      setError(null)
      setSaved(false)
    }
  }, [opened, messageContent, memoryId])

  // Load existing memory if memoryId provided
  useEffect(() => {
    const loadExistingMemory = async () => {
      if (opened && memoryId) {
        setLoading(true)
        try {
          // TODO: Implement get memory by ID API
          // For now, show that memory is already stored
          setExtractedMemory(messageContent)
          setSaved(true)
        } catch (err) {
          setError('Failed to load memory details')
        } finally {
          setLoading(false)
        }
      }
    }

    loadExistingMemory()
  }, [opened, memoryId, messageContent])

  const handleSaveMemory = async () => {
    if (!extractedMemory.trim()) return

    setSaving(true)
    setError(null)

    try {
      const result = await memoryApi.createMemory({
        userAddress: userAddress,
        content: extractedMemory,
        category
      })

      if (result) {
        setSaved(true)
        setTimeout(() => {
          onClose()
        }, 1500) // Auto-close after showing success
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save memory')
    } finally {
      setSaving(false)
    }
  }

  const categoryOptions = [
    { value: 'personal', label: 'Personal Information' },
    { value: 'work', label: 'Work & Career' },
    { value: 'preferences', label: 'Preferences & Interests' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'health', label: 'Health & Medical' },
    { value: 'travel', label: 'Travel & Location' },
    { value: 'education', label: 'Education & Skills' },
    { value: 'goals', label: 'Goals & Plans' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconBrain size={20} style={{ color: '#4CAF50' }} />
          <Text fw={600}>
            {memoryId ? 'Memory Details' : 'Add to Memory'}
          </Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        {loading && (
          <Group justify="center">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">Loading memory details...</Text>
          </Group>
        )}

        {saved && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Memory Saved!"
            color="green"
            variant="light"
          >
            Your personal information has been securely stored in your decentralized memory.
          </Alert>
        )}

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}

        <Paper p="md" bg="gray.0" radius="md">
          <Text size="sm" c="dimmed" mb="xs">
            Original Message:
          </Text>
          <Text size="sm" style={{ fontStyle: 'italic' }}>
            "{messageContent}"
          </Text>
        </Paper>

        {!memoryId && (
          <>
            <Textarea
              label="Memory Content"
              description="Edit or refine what you'd like to remember from this message"
              placeholder="Enter the information you want to store..."
              value={extractedMemory}
              onChange={(e) => setExtractedMemory(e.target.value)}
              minRows={3}
              maxRows={6}
              disabled={saving}
            />

            <Select
              label="Category"
              description="Choose the best category for this memory"
              data={categoryOptions}
              value={category}
              onChange={(value) => setCategory(value || 'personal')}
              disabled={saving}
            />
          </>
        )}

        {memoryId && (
          <Paper p="md" bg="green.0" radius="md">
            <Group>
              <Badge color="green" variant="light">
                <IconBrain size={12} style={{ marginRight: 4 }} />
                Stored
              </Badge>
              <Text size="sm" c="dimmed">
                Memory ID: {memoryId}
              </Text>
            </Group>
            <Text size="sm" mt="xs">
              This information has been saved to your personal memory vault.
            </Text>
          </Paper>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={saving}>
            {saved ? 'Close' : 'Cancel'}
          </Button>
          
          {!memoryId && !saved && (
            <Button
              onClick={handleSaveMemory}
              loading={saving}
              disabled={!extractedMemory.trim()}
              leftSection={<IconBrain size={16} />}
            >
              Save to Memory
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  )
}