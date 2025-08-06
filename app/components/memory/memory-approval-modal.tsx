'use client'

import { useState } from 'react'
import { Modal, Button, Text, Group, Stack, Card, Badge, Loader } from '@mantine/core'
import { MemoryExtraction, memoryIntegrationService } from '@/app/services/memoryIntegration'
import { useWallet } from '@suiet/wallet-kit'

interface MemoryApprovalModalProps {
  opened: boolean
  onClose: () => void
  memoryExtraction: MemoryExtraction
  userAddress: string
  onApproved?: (memoryId: string) => void
  onRejected?: () => void
}

export function MemoryApprovalModal({
  opened,
  onClose,
  memoryExtraction,
  userAddress,
  onApproved,
  onRejected
}: MemoryApprovalModalProps) {
  const wallet = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleApprove = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Pass the wallet to enable blockchain operations
      const result = await memoryIntegrationService.saveApprovedMemory(
        memoryExtraction,
        userAddress,
        wallet
      )
      
      if (result.success && result.memoryId) {
        onApproved?.(result.memoryId)
        onClose()
      } else {
        setError(result.message || 'Failed to save memory')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleReject = () => {
    onRejected?.()
    onClose()
  }
  
  return (
    <Modal
      opened={opened}
      onClose={isSubmitting ? () => {} : onClose}
      title="Save this as a memory?"
      size="lg"
      closeOnClickOutside={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <Stack spacing="md">
        <Text>
          I detected something that might be worth remembering. Would you like me to save this?
        </Text>
        
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stack spacing="xs">
            <Group position="apart">
              <Badge color="blue" variant="light">
                {memoryExtraction.category}
              </Badge>
              <Text size="sm" color="dimmed">
                Confidence: {Math.round(memoryExtraction.confidence * 100)}%
              </Text>
            </Group>
            
            <Text weight={500}>Original Text:</Text>
            <Text size="sm" color="dimmed">
              {memoryExtraction.content}
            </Text>
            
            {memoryExtraction.extractedFacts && memoryExtraction.extractedFacts.length > 0 && (
              <>
                <Text weight={500} mt="xs">Extracted Facts:</Text>
                <Stack spacing="xs">
                  {memoryExtraction.extractedFacts.map((fact, index) => (
                    <Text key={index} size="sm" color="dimmed">
                      • {fact}
                    </Text>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        </Card>
        
        {error && (
          <Text color="red" size="sm">
            {error}
          </Text>
        )}
        
        <Group position="right" mt="md">
          <Button variant="outline" onClick={handleReject} disabled={isSubmitting}>
            Don't Save
          </Button>
          
          <Button onClick={handleApprove} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader size="xs" color="white" mr="xs" /> Saving...
              </>
            ) : (
              'Save as Memory'
            )}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}