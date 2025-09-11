'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Badge,
  Loader,
  Alert,
  Textarea,
  Select,
  Checkbox,
  ActionIcon,
  Divider,
  Paper,
  Title,
  ScrollArea,
  Tooltip
} from '@mantine/core'
import {
  IconBrain,
  IconAlertCircle,
  IconCheck,
  IconEdit,
  IconTrash,
  IconEye,
  IconDeviceFloppy,
  IconX
} from '@tabler/icons-react'
import { MemoryExtraction } from '@/app/services/memoryIntegration'
import { useWallet } from '@suiet/wallet-kit'

interface MemorySelectionModalProps {
  opened: boolean
  onClose: () => void
  extractedMemories: MemoryExtraction[]
  userAddress: string
  onMemoriesSaved?: (savedMemoryIds: string[]) => void
  onError?: (error: string) => void
}

interface EditableMemory extends MemoryExtraction {
  id: string
  selected: boolean
  editing: boolean
  originalContent: string
}

const MEMORY_CATEGORIES = [
  { value: 'personal_info', label: 'Personal Information' },
  { value: 'preferences', label: 'Preferences' },
  { value: 'skills', label: 'Skills & Expertise' },
  { value: 'goals', label: 'Goals & Objectives' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'knowledge', label: 'Knowledge & Facts' },
  { value: 'general', label: 'General' }
]

export function MemorySelectionModal({
  opened,
  onClose,
  extractedMemories,
  userAddress,
  onMemoriesSaved,
  onError
}: MemorySelectionModalProps) {
  const wallet = useWallet()
  const [memories, setMemories] = useState<EditableMemory[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [savingProgress, setSavingProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [previewMemory, setPreviewMemory] = useState<EditableMemory | null>(null)

  // Initialize memories when modal opens
  useEffect(() => {
    if (opened && extractedMemories.length > 0) {
      const editableMemories: EditableMemory[] = extractedMemories.map((memory, index) => ({
        ...memory,
        id: `memory-${index}-${Date.now()}`,
        selected: memory.shouldSave,
        editing: false,
        originalContent: memory.content
      }))
      setMemories(editableMemories)
      setError(null)
    }
  }, [opened, extractedMemories])

  const handleSelectAll = (selected: boolean) => {
    setMemories(prev => prev.map(memory => ({ ...memory, selected })))
  }

  const handleMemorySelect = (id: string, selected: boolean) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { ...memory, selected } : memory
    ))
  }

  const handleStartEdit = (id: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { ...memory, editing: true } : memory
    ))
  }

  const handleCancelEdit = (id: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { 
        ...memory, 
        editing: false, 
        content: memory.originalContent 
      } : memory
    ))
  }

  const handleSaveEdit = (id: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { 
        ...memory, 
        editing: false, 
        originalContent: memory.content 
      } : memory
    ))
  }

  const handleContentChange = (id: string, content: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { ...memory, content } : memory
    ))
  }

  const handleCategoryChange = (id: string, category: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { ...memory, category } : memory
    ))
  }

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(memory => memory.id !== id))
  }

  const handlePreview = (memory: EditableMemory) => {
    setPreviewMemory(memory)
  }

  const handleSaveSelected = async () => {
    const selectedMemories = memories.filter(memory => memory.selected)
    
    if (selectedMemories.length === 0) {
      setError('Please select at least one memory to save.')
      return
    }

    if (!wallet.connected) {
      setError('Please connect your wallet to save memories.')
      return
    }

    setIsSaving(true)
    setSavingProgress({ current: 0, total: selectedMemories.length })
    setError(null)

    const savedMemoryIds: string[] = []
    const errors: string[] = []

    try {
      // Import the memory integration service
      const { memoryIntegrationService } = await import('@/app/services/memoryIntegration')

      for (let i = 0; i < selectedMemories.length; i++) {
        const memory = selectedMemories[i]
        setSavingProgress({ current: i + 1, total: selectedMemories.length })

        try {
          const result = await memoryIntegrationService.saveApprovedMemory(
            {
              shouldSave: true,
              category: memory.category,
              content: memory.content,
              extractedFacts: memory.extractedFacts,
              confidence: memory.confidence
            },
            userAddress,
            wallet
          )

          if (result.success && result.memoryId) {
            savedMemoryIds.push(result.memoryId)
          } else {
            errors.push(`Failed to save "${memory.content.substring(0, 50)}...": ${result.message}`)
          }
        } catch (err) {
          errors.push(`Error saving "${memory.content.substring(0, 50)}...": ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }

      if (savedMemoryIds.length > 0) {
        onMemoriesSaved?.(savedMemoryIds)
        
        if (errors.length === 0) {
          // All memories saved successfully
          onClose()
        } else {
          // Some memories saved, show partial success
          setError(`${savedMemoryIds.length} memories saved successfully. ${errors.length} failed: ${errors.join(', ')}`)
        }
      } else {
        // No memories saved
        setError(`Failed to save memories: ${errors.join(', ')}`)
        onError?.(errors.join(', '))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsSaving(false)
      setSavingProgress({ current: 0, total: 0 })
    }
  }

  const selectedCount = memories.filter(memory => memory.selected).length

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group>
            <IconBrain size={24} />
            <Title order={3}>Select Memories to Save</Title>
          </Group>
        }
        size="xl"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack>
          {memories.length === 0 ? (
            <Alert icon={<IconAlertCircle size={16} />} color="blue">
              No memories were extracted from this conversation.
            </Alert>
          ) : (
            <>
              <Paper p="md" bg="blue.0" radius="md">
                <Group justify="space-between">
                  <Text size="sm">
                    Found {memories.length} potential memories. Select which ones to save to your personal vault.
                  </Text>
                  <Group>
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => handleSelectAll(true)}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => handleSelectAll(false)}
                    >
                      Select None
                    </Button>
                  </Group>
                </Group>
              </Paper>

              <ScrollArea.Autosize mah={400}>
                <Stack gap="md">
                  {memories.map((memory) => (
                    <Card key={memory.id} padding="md" radius="md" withBorder>
                      <Stack gap="sm">
                        <Group justify="space-between" align="flex-start">
                          <Group>
                            <Checkbox
                              checked={memory.selected}
                              onChange={(event) => handleMemorySelect(memory.id, event.currentTarget.checked)}
                            />
                            <Badge
                              color={memory.confidence > 0.8 ? 'green' : memory.confidence > 0.6 ? 'yellow' : 'orange'}
                              variant="light"
                            >
                              {Math.round(memory.confidence * 100)}% confidence
                            </Badge>
                          </Group>
                          
                          <Group gap="xs">
                            <Tooltip label="Preview">
                              <ActionIcon
                                variant="subtle"
                                size="sm"
                                onClick={() => handlePreview(memory)}
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                            </Tooltip>
                            
                            {memory.editing ? (
                              <>
                                <Tooltip label="Save changes">
                                  <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    color="green"
                                    onClick={() => handleSaveEdit(memory.id)}
                                  >
                                    <IconDeviceFloppy size={16} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Cancel">
                                  <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    color="red"
                                    onClick={() => handleCancelEdit(memory.id)}
                                  >
                                    <IconX size={16} />
                                  </ActionIcon>
                                </Tooltip>
                              </>
                            ) : (
                              <Tooltip label="Edit">
                                <ActionIcon
                                  variant="subtle"
                                  size="sm"
                                  onClick={() => handleStartEdit(memory.id)}
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                            
                            <Tooltip label="Delete">
                              <ActionIcon
                                variant="subtle"
                                size="sm"
                                color="red"
                                onClick={() => handleDeleteMemory(memory.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>

                        <Select
                          label="Category"
                          value={memory.category}
                          onChange={(value) => value && handleCategoryChange(memory.id, value)}
                          data={MEMORY_CATEGORIES}
                          disabled={!memory.editing}
                        />

                        {memory.editing ? (
                          <Textarea
                            label="Memory Content"
                            value={memory.content}
                            onChange={(event) => handleContentChange(memory.id, event.currentTarget.value)}
                            minRows={3}
                            maxRows={6}
                            autosize
                          />
                        ) : (
                          <Paper p="sm" bg="gray.0" radius="sm">
                            <Text size="sm">{memory.content}</Text>
                          </Paper>
                        )}

                        {memory.extractedFacts.length > 0 && (
                          <div>
                            <Text size="xs" c="dimmed" mb="xs">Extracted Facts:</Text>
                            <Group gap="xs">
                              {memory.extractedFacts.map((fact, index) => (
                                <Badge key={index} variant="outline" size="sm">
                                  {fact}
                                </Badge>
                              ))}
                            </Group>
                          </div>
                        )}
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </ScrollArea.Autosize>

              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                  {error}
                </Alert>
              )}

              <Divider />

              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {selectedCount} of {memories.length} memories selected
                </Text>
                
                <Group>
                  <Button variant="subtle" onClick={onClose} disabled={isSaving}>
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={handleSaveSelected}
                    disabled={selectedCount === 0 || isSaving}
                    leftSection={isSaving ? <Loader size="xs" /> : <IconBrain size={16} />}
                  >
                    {isSaving 
                      ? `Saving ${savingProgress.current}/${savingProgress.total}...`
                      : `Save ${selectedCount} Memories`
                    }
                  </Button>
                </Group>
              </Group>
            </>
          )}
        </Stack>
      </Modal>

      {/* Preview Modal */}
      <Modal
        opened={!!previewMemory}
        onClose={() => setPreviewMemory(null)}
        title="Memory Preview"
        size="md"
      >
        {previewMemory && (
          <Stack>
            <Group>
              <Badge color="blue" variant="light">
                {MEMORY_CATEGORIES.find(cat => cat.value === previewMemory.category)?.label || previewMemory.category}
              </Badge>
              <Badge
                color={previewMemory.confidence > 0.8 ? 'green' : previewMemory.confidence > 0.6 ? 'yellow' : 'orange'}
                variant="light"
              >
                {Math.round(previewMemory.confidence * 100)}% confidence
              </Badge>
            </Group>
            
            <Paper p="md" bg="gray.0" radius="md">
              <Text>{previewMemory.content}</Text>
            </Paper>
            
            {previewMemory.extractedFacts.length > 0 && (
              <div>
                <Text size="sm" fw={500} mb="xs">Extracted Facts:</Text>
                <Stack gap="xs">
                  {previewMemory.extractedFacts.map((fact, index) => (
                    <Text key={index} size="sm" c="dimmed">• {fact}</Text>
                  ))}
                </Stack>
              </div>
            )}
            
            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setPreviewMemory(null)}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  )
}
