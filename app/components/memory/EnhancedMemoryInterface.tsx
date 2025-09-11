'use client'

import React, { useState, useEffect } from 'react'
import {
  Stack,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Badge,
  Alert,
  Card,
  ActionIcon,
  Modal,
  Progress,
  Divider,
  Tabs,
  ScrollArea,
  Loader,
  Center,
  Tooltip,
  ThemeIcon
} from '@mantine/core'
import { 
  IconBrain,
  IconLock, 
  IconLockOpen,
  IconShield,
  IconClock,
  IconEye,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconDatabase,
  IconCloudDownload
} from '@tabler/icons-react'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { memoryApi } from '@/app/api/memoryApi'
import { sealService } from '@/app/services/sealService'
import { memoryDecryptionCache } from '@/app/services/memoryDecryptionCache'
import { notifications } from '@mantine/notifications'

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

interface MemoryWithSealStatus extends Memory {
  sealStatus: 'encrypted' | 'decrypting' | 'decrypted' | 'error'
  decryptedContent?: string
  sealError?: string
  accessPolicy?: 'self' | 'allowlist' | 'timelock'
  canDecrypt?: boolean
}

export function EnhancedMemoryInterface() {
  const { userAddress, isAuthenticated } = useSuiAuth()
  
  const [memories, setMemories] = useState<MemoryWithSealStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMemory, setSelectedMemory] = useState<MemoryWithSealStatus | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string | null>('all')
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    encrypted: 0,
    decrypted: 0,
    errors: 0
  })

  useEffect(() => {
    if (isAuthenticated && userAddress) {
      loadMemories()
    }
  }, [isAuthenticated, userAddress])

  const loadMemories = async () => {
    if (!userAddress) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await memoryApi.getMemories(userAddress)
      
      if (response.success) {
        // Enhance memories with Seal status
        const enhancedMemories: MemoryWithSealStatus[] = response.memories.map(memory => ({
          ...memory,
          sealStatus: memory.isEncrypted ? 'encrypted' : 'decrypted',
          canDecrypt: true // Will be updated based on access policies
        }))
        
        setMemories(enhancedMemories)
        updateStats(enhancedMemories)
        
        // Auto-decrypt memories in background
        autoDecryptMemories(enhancedMemories)
      } else {
        setError('Failed to load memories')
      }
    } catch (error) {
      console.error('Failed to load memories:', error)
      setError(error instanceof Error ? error.message : 'Failed to load memories')
    } finally {
      setLoading(false)
    }
  }

  const updateStats = (memories: MemoryWithSealStatus[]) => {
    const stats = {
      total: memories.length,
      encrypted: memories.filter(m => m.sealStatus === 'encrypted').length,
      decrypted: memories.filter(m => m.sealStatus === 'decrypted').length,
      errors: memories.filter(m => m.sealStatus === 'error').length
    }
    setStats(stats)
  }

  const autoDecryptMemories = async (memories: MemoryWithSealStatus[]) => {
    const encryptedMemories = memories.filter(m => 
      m.isEncrypted && m.sealStatus === 'encrypted' && m.walrusHash
    )

    // Process in small batches
    const batchSize = 3
    for (let i = 0; i < encryptedMemories.length; i += batchSize) {
      const batch = encryptedMemories.slice(i, i + batchSize)
      
      await Promise.all(batch.map(async (memory) => {
        try {
          // Update status to decrypting
          updateMemoryStatus(memory.id, 'decrypting')
          
          // Check cache first
          const cachedContent = await memoryDecryptionCache.getDecryptedContent(memory.walrusHash!)
          if (cachedContent) {
            updateMemoryContent(memory.id, cachedContent, 'decrypted')
            return
          }
          
          // Try to decrypt with Seal
          if (userAddress) {
            const decryptedContent = await sealService.decryptMemory(memory.walrusHash!, userAddress)
            updateMemoryContent(memory.id, decryptedContent, 'decrypted')
            
            // Cache the result
            memoryDecryptionCache.markMemoryDecrypted(memory.id)
          }
        } catch (error) {
          console.error(`Failed to decrypt memory ${memory.id}:`, error)
          updateMemoryStatus(memory.id, 'error', error instanceof Error ? error.message : 'Decryption failed')
        }
      }))
      
      // Small delay between batches
      if (i + batchSize < encryptedMemories.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }

  const updateMemoryStatus = (memoryId: string, status: MemoryWithSealStatus['sealStatus'], error?: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === memoryId 
        ? { ...memory, sealStatus: status, sealError: error }
        : memory
    ))
  }

  const updateMemoryContent = (memoryId: string, content: string, status: MemoryWithSealStatus['sealStatus']) => {
    setMemories(prev => {
      const updated = prev.map(memory => 
        memory.id === memoryId 
          ? { ...memory, decryptedContent: content, sealStatus: status, sealError: undefined }
          : memory
      )
      updateStats(updated)
      return updated
    })
  }

  const handleManualDecrypt = async (memory: MemoryWithSealStatus) => {
    if (!userAddress || !memory.walrusHash) return
    
    try {
      updateMemoryStatus(memory.id, 'decrypting')
      
      const decryptedContent = await sealService.decryptMemory(memory.walrusHash, userAddress)
      updateMemoryContent(memory.id, decryptedContent, 'decrypted')
      
      notifications.show({
        title: 'Memory Decrypted',
        message: 'Successfully decrypted memory content',
        color: 'green',
        icon: <IconCheck size={16} />
      })
    } catch (error) {
      console.error('Manual decryption failed:', error)
      updateMemoryStatus(memory.id, 'error', error instanceof Error ? error.message : 'Decryption failed')
      
      notifications.show({
        title: 'Decryption Failed',
        message: error instanceof Error ? error.message : 'Failed to decrypt memory',
        color: 'red',
        icon: <IconX size={16} />
      })
    }
  }

  const handleViewMemory = (memory: MemoryWithSealStatus) => {
    setSelectedMemory(memory)
    setViewModalOpen(true)
  }

  const getStatusIcon = (status: MemoryWithSealStatus['sealStatus']) => {
    switch (status) {
      case 'encrypted': return <IconLock size={14} />
      case 'decrypting': return <Loader size={14} />
      case 'decrypted': return <IconLockOpen size={14} />
      case 'error': return <IconAlertCircle size={14} />
    }
  }

  const getStatusColor = (status: MemoryWithSealStatus['sealStatus']) => {
    switch (status) {
      case 'encrypted': return 'orange'
      case 'decrypting': return 'blue'
      case 'decrypted': return 'green'
      case 'error': return 'red'
    }
  }

  const getStatusLabel = (status: MemoryWithSealStatus['sealStatus']) => {
    switch (status) {
      case 'encrypted': return 'Encrypted'
      case 'decrypting': return 'Decrypting...'
      case 'decrypted': return 'Decrypted'
      case 'error': return 'Error'
    }
  }

  const filteredMemories = memories.filter(memory => {
    switch (activeTab) {
      case 'encrypted': return memory.sealStatus === 'encrypted'
      case 'decrypted': return memory.sealStatus === 'decrypted'
      case 'errors': return memory.sealStatus === 'error'
      default: return true
    }
  })

  if (!isAuthenticated) {
    return (
      <Alert color="blue" icon={<IconBrain size={16} />}>
        Please connect your wallet to access your encrypted memories
      </Alert>
    )
  }

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <div>
            <Title order={3}>Enhanced Memory Access</Title>
            <Text size="sm" c="dimmed">
              Manage your encrypted memories with Seal integration
            </Text>
          </div>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={loadMemories}
            loading={loading}
            variant="light"
          >
            Refresh
          </Button>
        </Group>

        {error && (
          <Alert color="red" icon={<IconX size={16} />} mb="md" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Statistics */}
        <Paper p="md" bg="gray.0" mb="md">
          <Group grow>
            <div style={{ textAlign: 'center' }}>
              <ThemeIcon color="blue" size="lg" mb="xs">
                <IconDatabase size={20} />
              </ThemeIcon>
              <Text fw={600}>{stats.total}</Text>
              <Text size="xs" c="dimmed">Total Memories</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ThemeIcon color="orange" size="lg" mb="xs">
                <IconLock size={20} />
              </ThemeIcon>
              <Text fw={600}>{stats.encrypted}</Text>
              <Text size="xs" c="dimmed">Encrypted</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ThemeIcon color="green" size="lg" mb="xs">
                <IconLockOpen size={20} />
              </ThemeIcon>
              <Text fw={600}>{stats.decrypted}</Text>
              <Text size="xs" c="dimmed">Decrypted</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ThemeIcon color="red" size="lg" mb="xs">
                <IconAlertCircle size={20} />
              </ThemeIcon>
              <Text fw={600}>{stats.errors}</Text>
              <Text size="xs" c="dimmed">Errors</Text>
            </div>
          </Group>
        </Paper>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="all">All ({stats.total})</Tabs.Tab>
            <Tabs.Tab value="encrypted" leftSection={<IconLock size={14} />}>
              Encrypted ({stats.encrypted})
            </Tabs.Tab>
            <Tabs.Tab value="decrypted" leftSection={<IconLockOpen size={14} />}>
              Decrypted ({stats.decrypted})
            </Tabs.Tab>
            {stats.errors > 0 && (
              <Tabs.Tab value="errors" leftSection={<IconAlertCircle size={14} />}>
                Errors ({stats.errors})
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value={activeTab} pt="md">
            <ScrollArea h={400}>
              <Stack gap="sm">
                {loading ? (
                  <Center py="xl">
                    <Stack align="center" gap="sm">
                      <Loader size="lg" />
                      <Text c="dimmed">Loading memories...</Text>
                    </Stack>
                  </Center>
                ) : filteredMemories.length === 0 ? (
                  <Center py="xl">
                    <Stack align="center" gap="sm">
                      <IconBrain size={48} opacity={0.5} />
                      <Text c="dimmed">No memories found</Text>
                    </Stack>
                  </Center>
                ) : (
                  filteredMemories.map((memory) => (
                    <Card key={memory.id} withBorder>
                      <Group justify="space-between" mb="sm">
                        <div style={{ flex: 1 }}>
                          <Group gap="xs" mb="xs">
                            <Badge
                              color={getStatusColor(memory.sealStatus)}
                              variant="light"
                              leftSection={getStatusIcon(memory.sealStatus)}
                            >
                              {getStatusLabel(memory.sealStatus)}
                            </Badge>
                            <Badge variant="outline" size="sm">
                              {memory.category}
                            </Badge>
                          </Group>
                          
                          <Text size="sm" lineClamp={2}>
                            {memory.sealStatus === 'decrypted' && memory.decryptedContent
                              ? memory.decryptedContent.substring(0, 150) + '...'
                              : memory.content.substring(0, 150) + '...'
                            }
                          </Text>
                          
                          {memory.sealError && (
                            <Text size="xs" c="red" mt="xs">
                              Error: {memory.sealError}
                            </Text>
                          )}
                        </div>
                        
                        <Group gap="xs">
                          <Tooltip label="View Memory">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewMemory(memory)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>
                          
                          {memory.sealStatus === 'encrypted' && (
                            <Tooltip label="Decrypt Memory">
                              <ActionIcon
                                variant="subtle"
                                color="green"
                                onClick={() => handleManualDecrypt(memory)}
                                loading={memory.sealStatus === 'decrypting'}
                              >
                                <IconLockOpen size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Group>
                      </Group>
                      
                      <Group justify="space-between" align="center">
                        <Text size="xs" c="dimmed">
                          {new Date(memory.timestamp).toLocaleString()}
                        </Text>
                        {memory.walrusHash && (
                          <Badge size="xs" variant="dot">
                            Walrus: {memory.walrusHash.slice(0, 8)}...
                          </Badge>
                        )}
                      </Group>
                    </Card>
                  ))
                )}
              </Stack>
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* View Memory Modal */}
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Memory Details"
        size="lg"
      >
        {selectedMemory && (
          <Stack gap="md">
            <Group justify="space-between">
              <Badge
                color={getStatusColor(selectedMemory.sealStatus)}
                variant="light"
                leftSection={getStatusIcon(selectedMemory.sealStatus)}
              >
                {getStatusLabel(selectedMemory.sealStatus)}
              </Badge>
              <Badge variant="outline">
                {selectedMemory.category}
              </Badge>
            </Group>

            <Divider />

            <div>
              <Text size="sm" c="dimmed" mb="xs">Content</Text>
              {selectedMemory.sealStatus === 'decrypted' && selectedMemory.decryptedContent ? (
                <Paper p="sm" bg="green.0">
                  <Text style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedMemory.decryptedContent}
                  </Text>
                </Paper>
              ) : selectedMemory.sealStatus === 'encrypted' ? (
                <Paper p="sm" bg="orange.0">
                  <Group gap="sm" mb="sm">
                    <IconLock size={16} />
                    <Text size="sm" fw={500}>Content is encrypted</Text>
                  </Group>
                  <Button
                    size="sm"
                    leftSection={<IconLockOpen size={14} />}
                    onClick={() => handleManualDecrypt(selectedMemory)}
                    loading={selectedMemory.sealStatus === 'decrypting'}
                  >
                    Decrypt Content
                  </Button>
                </Paper>
              ) : selectedMemory.sealStatus === 'error' ? (
                <Alert color="red" icon={<IconAlertCircle size={16} />}>
                  {selectedMemory.sealError || 'Failed to decrypt content'}
                </Alert>
              ) : (
                <Paper p="sm" bg="gray.0">
                  <Text style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedMemory.content}
                  </Text>
                </Paper>
              )}
            </div>

            <div>
              <Text size="sm" c="dimmed" mb="xs">Metadata</Text>
              <Group gap="md">
                <Text size="xs">
                  <strong>ID:</strong> {selectedMemory.id.slice(0, 16)}...
                </Text>
                <Text size="xs">
                  <strong>Created:</strong> {new Date(selectedMemory.timestamp).toLocaleString()}
                </Text>
                {selectedMemory.walrusHash && (
                  <Text size="xs">
                    <strong>Walrus:</strong> {selectedMemory.walrusHash.slice(0, 16)}...
                  </Text>
                )}
              </Group>
            </div>
          </Stack>
        )}
      </Modal>
    </Stack>
  )
}
