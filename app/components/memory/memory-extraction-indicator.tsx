'use client'

import { useState, useEffect } from 'react'
import { ActionIcon, Tooltip, Modal, Stack, Text, Button, Group, Badge } from '@mantine/core'
import { IconBrain, IconPlus, IconCheck } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { type DetectionResult } from '@/app/services/memoryIntegration'
import { memoryApi } from '@/app/api'

interface MemoryExtractionIndicatorProps {
  message: string
  userAddress: string
  onMemoryStored?: (count: number) => void
}

export function MemoryExtractionIndicator({
  message,
  userAddress,
  onMemoryStored
}: MemoryExtractionIndicatorProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [isStoring, setIsStoring] = useState(false)
  const [storedMemories, setStoredMemories] = useState<string[]>([])

  // Memory detection is now handled by backend automatically
  // This component shows a simplified indicator
  useEffect(() => {
    // Backend handles detection automatically during chat streaming
    // This component now shows a basic indicator for manual memory addition
    setDetectionResult({
      shouldStore: false,
      memories: [],
      reasoning: 'Memory detection moved to backend'
    })
  }, [message])

  const handleIconClick = () => {
    // Always allow opening for manual memory addition
    // since backend handles automatic detection
    open()
  }

  const handleStoreMemories = async () => {
    if (!detectionResult || !detectionResult.shouldStore) return

    setIsStoring(true)
    const stored: string[] = []
    const errors: string[] = []

    try {
      for (const memory of detectionResult.memories) {
        try {
          const response = await memoryApi.createMemory({
            content: memory.content,
            category: memory.category,
            userAddress: userAddress,
            userSignature: 'dummy_signature' // TODO: Use real signature
          })

          if (response.success) {
            stored.push(memory.category)
          } else {
            errors.push(`Failed to store ${memory.category}: ${response.error || 'Unknown error'}`)
          }
        } catch (error) {
          console.error('Failed to store memory:', error)
          errors.push(`Failed to store ${memory.category}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      setStoredMemories(stored)
      onMemoryStored?.(stored.length)

      // Show user feedback about results
      if (errors.length > 0) {
        console.warn('Memory storage errors:', errors)
        // TODO: Show user-friendly error notification
      }

      // Auto-close after processing
      setTimeout(() => {
        close()
      }, 2000)
    } catch (error) {
      console.error('Error storing memories:', error)
    } finally {
      setIsStoring(false)
    }
  }

  // Don't show indicator if no extractable information detected
  if (!detectionResult?.shouldStore) {
    return null
  }

  const isStored = storedMemories.length > 0

  return (
    <>
      <Tooltip 
        label={isStored ? 'Memories stored' : 'Extract personal information'} 
        position="top"
      >
        <ActionIcon
          variant={isStored ? 'filled' : 'light'}
          color={isStored ? 'green' : 'blue'}
          size="sm"
          onClick={handleIconClick}
          style={{ opacity: 0.7 }}
        >
          {isStored ? <IconCheck size={14} /> : <IconBrain size={14} />}
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={close}
        title="Extract Personal Information"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            I detected some personal information in your message that could be stored in your memory layer:
          </Text>

          <Stack gap="xs">
            {detectionResult?.memories.map((memory, index) => (
              <Group key={index} justify="space-between" p="sm" style={{ 
                border: '1px solid var(--mantine-color-gray-3)', 
                borderRadius: 'var(--mantine-radius-sm)' 
              }}>
                <Stack gap={4} style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Badge size="xs" variant="light" color="blue">
                      {memory.category}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {Math.round(memory.confidence * 100)}% confidence
                    </Text>
                  </Group>
                  <Text size="sm">
                    {memory.content}
                  </Text>
                  {memory.extractedInfo.length > 0 && (
                    <Stack gap={2}>
                      {memory.extractedInfo.map((info, i) => (
                        <Text key={i} size="xs" c="dimmed">
                          <strong>{info.key}:</strong> {info.value}
                        </Text>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Group>
            ))}
          </Stack>

          <Text size="xs" c="dimmed">
            {detectionResult?.reasoning}
          </Text>

          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={close} disabled={isStoring}>
              Cancel
            </Button>
            <Button 
              onClick={handleStoreMemories} 
              loading={isStoring}
              leftSection={<IconPlus size={16} />}
              disabled={storedMemories.length > 0}
            >
              {storedMemories.length > 0 ? 'Stored!' : 'Store Memories'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
