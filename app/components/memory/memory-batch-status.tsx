'use client'

import { useState, useEffect } from 'react'
import { Card, Text, Group, Badge, Progress, ActionIcon, Tooltip } from '@mantine/core'
import { IconRefresh, IconClock, IconCheck } from '@tabler/icons-react'
import { httpApi } from '@/app/api/httpApi'

interface BatchStats {
  totalUsers: number
  totalPendingVectors: number
  activeBatchJobs: number
  cacheEntries: Array<{
    userAddress: string
    pendingVectors: number
    lastModified: string
    isDirty: boolean
  }>
}

interface MemoryBatchStatusProps {
  userAddress: string
  onForceFlush?: () => void
}

export function MemoryBatchStatus({ userAddress, onForceFlush }: MemoryBatchStatusProps) {
  const [stats, setStats] = useState<BatchStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await httpApi.get('/api/memories/batch-stats')
      setStats(response)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching batch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleForceFlush = async () => {
    try {
      setLoading(true)
      await httpApi.post(`/api/memories/force-flush/${userAddress}`)
      await fetchStats() // Refresh stats after flush
      onForceFlush?.()
    } catch (error) {
      console.error('Error forcing flush:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000)
    
    return () => clearInterval(interval)
  }, [])

  if (!stats) {
    return null
  }

  const userEntry = stats.cacheEntries.find(entry => entry.userAddress === userAddress)
  const hasPendingVectors = userEntry && userEntry.pendingVectors > 0

  if (!hasPendingVectors && stats.totalPendingVectors === 0) {
    return null // Don't show if no pending operations
  }

  return (
    <Card padding="sm" radius="md" withBorder bg="blue.0">
      <Group justify="space-between" align="flex-start">
        <div style={{ flex: 1 }}>
          <Group gap="xs" mb="xs">
            <IconClock size={16} color="blue" />
            <Text size="sm" fw={500}>Memory Index Processing</Text>
            {hasPendingVectors && (
              <Badge size="sm" color="blue" variant="light">
                {userEntry.pendingVectors} pending
              </Badge>
            )}
          </Group>
          
          {hasPendingVectors ? (
            <>
              <Text size="xs" c="dimmed" mb="xs">
                Your memories are being processed and will be searchable shortly.
              </Text>
              <Progress 
                value={100} 
                size="xs" 
                color="blue" 
                animated 
                mb="xs"
              />
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  Processing {userEntry.pendingVectors} memories...
                </Text>
                <Tooltip label="Force immediate processing">
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="blue"
                    onClick={handleForceFlush}
                    loading={loading}
                  >
                    <IconRefresh size={12} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </>
          ) : (
            <Group gap="xs">
              <IconCheck size={14} color="green" />
              <Text size="xs" c="green">
                All memories processed and searchable
              </Text>
            </Group>
          )}
        </div>
        
        <Group gap="xs">
          <Tooltip label="Refresh status">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={fetchStats}
              loading={loading}
            >
              <IconRefresh size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      
      {lastUpdated && (
        <Text size="xs" c="dimmed" mt="xs">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      )}
      
      {stats.totalPendingVectors > 0 && (
        <Text size="xs" c="dimmed" mt="xs">
          System-wide: {stats.totalPendingVectors} memories being processed across {stats.activeBatchJobs} users
        </Text>
      )}
    </Card>
  )
}
