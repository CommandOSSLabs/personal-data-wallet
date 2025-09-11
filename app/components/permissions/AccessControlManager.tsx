'use client'

import React, { useState, useEffect } from 'react'
import {
  Stack,
  Paper,
  Title,
  Text,
  Button,
  TextInput,
  Select,
  Group,
  Badge,
  Alert,
  Table,
  ActionIcon,
  Modal,
  Textarea,
  Switch,
  NumberInput
} from '@mantine/core'
import { 
  IconPlus, 
  IconTrash, 
  IconEdit, 
  IconShield, 
  IconUsers, 
  IconClock,
  IconKey,
  IconCheck,
  IconX
} from '@tabler/icons-react'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { allowlistService, type AllowlistPolicy } from '@/app/services/allowlistService'

// Types for access control
interface AccessPolicy {
  id: string
  name: string
  type: 'allowlist' | 'timelock' | 'self'
  description: string
  isActive: boolean
  createdAt: string
  // Allowlist specific
  allowedAddresses?: string[]
  // Timelock specific
  unlockTime?: string
  // Metadata
  memoryCount?: number
}

interface AccessControlManagerProps {
  onPolicySelect?: (policy: AccessPolicy) => void
  selectedPolicyId?: string
}

export function AccessControlManager({ onPolicySelect, selectedPolicyId }: AccessControlManagerProps) {
  const { userAddress, isAuthenticated } = useSuiAuth()
  
  const [policies, setPolicies] = useState<AccessPolicy[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<AccessPolicy | null>(null)
  
  // Form states
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    type: 'allowlist' as 'allowlist' | 'timelock' | 'self',
    description: '',
    allowedAddresses: [''],
    unlockTime: '',
    isActive: true
  })

  // Load policies on mount
  useEffect(() => {
    if (isAuthenticated && userAddress) {
      loadPolicies()
    }
  }, [isAuthenticated, userAddress])

  const loadPolicies = async () => {
    setLoading(true)
    try {
      // For now, use mock data - in real implementation, this would call backend API
      const mockPolicies: AccessPolicy[] = [
        {
          id: 'policy-1',
          name: 'Personal Access',
          type: 'self',
          description: 'Only I can access this data',
          isActive: true,
          createdAt: new Date().toISOString(),
          memoryCount: 5
        },
        {
          id: 'policy-2',
          name: 'Family Members',
          type: 'allowlist',
          description: 'Family members can access',
          isActive: true,
          createdAt: new Date().toISOString(),
          allowedAddresses: ['0x123...abc', '0x456...def'],
          memoryCount: 3
        },
        {
          id: 'policy-3',
          name: 'Future Release',
          type: 'timelock',
          description: 'Unlock after specific date',
          isActive: true,
          createdAt: new Date().toISOString(),
          unlockTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          memoryCount: 1
        }
      ]
      setPolicies(mockPolicies)
    } catch (error) {
      setError('Failed to load access policies')
      console.error('Error loading policies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePolicy = async () => {
    if (!newPolicy.name.trim()) {
      setError('Policy name is required')
      return
    }

    setLoading(true)
    try {
      const policy: AccessPolicy = {
        id: `policy-${Date.now()}`,
        name: newPolicy.name,
        type: newPolicy.type,
        description: newPolicy.description,
        isActive: newPolicy.isActive,
        createdAt: new Date().toISOString(),
        memoryCount: 0
      }

      if (newPolicy.type === 'allowlist') {
        policy.allowedAddresses = newPolicy.allowedAddresses.filter(addr => addr.trim())
      } else if (newPolicy.type === 'timelock') {
        policy.unlockTime = newPolicy.unlockTime
      }

      // In real implementation, this would call backend API
      setPolicies(prev => [...prev, policy])
      
      // Reset form
      setNewPolicy({
        name: '',
        type: 'allowlist',
        description: '',
        allowedAddresses: [''],
        unlockTime: '',
        isActive: true
      })
      setCreateModalOpen(false)
      setError(null)
    } catch (error) {
      setError('Failed to create policy')
      console.error('Error creating policy:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return

    setLoading(true)
    try {
      // In real implementation, this would call backend API
      setPolicies(prev => prev.filter(p => p.id !== policyId))
    } catch (error) {
      setError('Failed to delete policy')
      console.error('Error deleting policy:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePolicy = async (policyId: string) => {
    setLoading(true)
    try {
      // In real implementation, this would call backend API
      setPolicies(prev => prev.map(p => 
        p.id === policyId ? { ...p, isActive: !p.isActive } : p
      ))
    } catch (error) {
      setError('Failed to toggle policy')
      console.error('Error toggling policy:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPolicyIcon = (type: string) => {
    switch (type) {
      case 'allowlist': return <IconUsers size={16} />
      case 'timelock': return <IconClock size={16} />
      case 'self': return <IconKey size={16} />
      default: return <IconShield size={16} />
    }
  }

  const getPolicyColor = (type: string) => {
    switch (type) {
      case 'allowlist': return 'blue'
      case 'timelock': return 'orange'
      case 'self': return 'green'
      default: return 'gray'
    }
  }

  const addAllowedAddress = () => {
    setNewPolicy(prev => ({
      ...prev,
      allowedAddresses: [...prev.allowedAddresses, '']
    }))
  }

  const updateAllowedAddress = (index: number, value: string) => {
    setNewPolicy(prev => ({
      ...prev,
      allowedAddresses: prev.allowedAddresses.map((addr, i) => i === index ? value : addr)
    }))
  }

  const removeAllowedAddress = (index: number) => {
    setNewPolicy(prev => ({
      ...prev,
      allowedAddresses: prev.allowedAddresses.filter((_, i) => i !== index)
    }))
  }

  if (!isAuthenticated) {
    return (
      <Alert color="blue" icon={<IconShield size={16} />}>
        Please connect your wallet to manage access control policies
      </Alert>
    )
  }

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <div>
            <Title order={3}>Access Control Policies</Title>
            <Text size="sm" c="dimmed">
              Manage who can access your encrypted memories
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpen(true)}
            loading={loading}
          >
            Create Policy
          </Button>
        </Group>

        {error && (
          <Alert color="red" icon={<IconX size={16} />} mb="md">
            {error}
          </Alert>
        )}

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Policy</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Memories</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {policies.map((policy) => (
              <Table.Tr 
                key={policy.id}
                style={{ 
                  backgroundColor: selectedPolicyId === policy.id ? 'var(--mantine-color-blue-0)' : undefined,
                  cursor: 'pointer'
                }}
                onClick={() => onPolicySelect?.(policy)}
              >
                <Table.Td>
                  <div>
                    <Text fw={500}>{policy.name}</Text>
                    <Text size="xs" c="dimmed">{policy.description}</Text>
                  </div>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={getPolicyColor(policy.type)}
                    variant="light"
                    leftSection={getPolicyIcon(policy.type)}
                  >
                    {policy.type}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Switch
                    checked={policy.isActive}
                    onChange={() => handleTogglePolicy(policy.id)}
                    size="sm"
                  />
                </Table.Td>
                <Table.Td>
                  <Badge variant="outline">{policy.memoryCount || 0}</Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingPolicy(policy)
                        setEditModalOpen(true)
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePolicy(policy.id)
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {policies.length === 0 && !loading && (
          <Text ta="center" c="dimmed" py="xl">
            No access policies created yet. Create your first policy to get started.
          </Text>
        )}
      </Paper>

      {/* Create Policy Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Access Policy"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Policy Name"
            placeholder="Enter policy name"
            value={newPolicy.name}
            onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <Select
            label="Policy Type"
            value={newPolicy.type}
            onChange={(value) => setNewPolicy(prev => ({ ...prev, type: value as any }))}
            data={[
              { value: 'self', label: 'Self Access - Only you can access' },
              { value: 'allowlist', label: 'Allowlist - Specific addresses can access' },
              { value: 'timelock', label: 'Time Lock - Unlock after specific time' }
            ]}
          />

          <Textarea
            label="Description"
            placeholder="Describe this policy"
            value={newPolicy.description}
            onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
          />

          {newPolicy.type === 'allowlist' && (
            <div>
              <Text size="sm" fw={500} mb="xs">Allowed Addresses</Text>
              {newPolicy.allowedAddresses.map((address, index) => (
                <Group key={index} mb="xs">
                  <TextInput
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => updateAllowedAddress(index, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => removeAllowedAddress(index)}
                    disabled={newPolicy.allowedAddresses.length === 1}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              <Button
                variant="subtle"
                leftSection={<IconPlus size={16} />}
                onClick={addAllowedAddress}
                size="sm"
              >
                Add Address
              </Button>
            </div>
          )}

          {newPolicy.type === 'timelock' && (
            <TextInput
              label="Unlock Time"
              type="datetime-local"
              value={newPolicy.unlockTime}
              onChange={(e) => setNewPolicy(prev => ({ ...prev, unlockTime: e.target.value }))}
              required
            />
          )}

          <Switch
            label="Active"
            description="Policy is active and can be used for new memories"
            checked={newPolicy.isActive}
            onChange={(e) => setNewPolicy(prev => ({ ...prev, isActive: e.target.checked }))}
          />

          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePolicy} loading={loading}>
              Create Policy
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
