'use client'

import React, { useState } from 'react'
import {
  Container,
  Title,
  Text,
  Tabs,
  Stack,
  Paper,
  Group,
  ThemeIcon,
  Badge
} from '@mantine/core'
import { 
  IconShield, 
  IconClock, 
  IconUsers, 
  IconKey,
  IconSettings
} from '@tabler/icons-react'
import { AccessControlManager } from '@/app/components/permissions/AccessControlManager'
import { TimelockManager } from '@/app/components/permissions/TimelockManager'
import { SealAuthComponent } from '@/app/components/auth/SealAuthComponent'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'

export default function PermissionsPage() {
  const { isAuthenticated, userAddress } = useSuiAuth()
  const [activeTab, setActiveTab] = useState<string | null>('access-control')
  const [sealSessionReady, setSealSessionReady] = useState(false)

  const handleSealSessionReady = (sessionId: string) => {
    console.log('Seal session ready:', sessionId)
    setSealSessionReady(true)
  }

  const handleSealError = (error: string) => {
    console.error('Seal error:', error)
    setSealSessionReady(false)
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Group gap="sm" mb="sm">
            <ThemeIcon size="lg" color="blue">
              <IconShield size={24} />
            </ThemeIcon>
            <div>
              <Title order={1}>Access Control & Permissions</Title>
              <Text c="dimmed">
                Manage encryption policies, access control, and time-locked content
              </Text>
            </div>
          </Group>
          
          {isAuthenticated && (
            <Group gap="sm">
              <Badge variant="light" color="green">
                Connected: {userAddress?.slice(0, 8)}...{userAddress?.slice(-6)}
              </Badge>
              {sealSessionReady && (
                <Badge variant="light" color="blue">
                  Seal Session Active
                </Badge>
              )}
            </Group>
          )}
        </div>

        {/* Seal Authentication */}
        {isAuthenticated && (
          <SealAuthComponent
            onSessionReady={handleSealSessionReady}
            onError={handleSealError}
            ttlMinutes={30}
          />
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab 
              value="access-control" 
              leftSection={<IconUsers size={16} />}
            >
              Access Control
            </Tabs.Tab>
            <Tabs.Tab 
              value="timelock" 
              leftSection={<IconClock size={16} />}
            >
              Time-locked Content
            </Tabs.Tab>
            <Tabs.Tab 
              value="settings" 
              leftSection={<IconSettings size={16} />}
            >
              Settings
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="access-control" pt="md">
            <Stack gap="md">
              <Paper p="md" withBorder bg="blue.0">
                <Group gap="sm">
                  <ThemeIcon color="blue" size="sm">
                    <IconUsers size={14} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={500}>Access Control Policies</Text>
                    <Text size="xs" c="dimmed">
                      Create and manage policies that control who can access your encrypted memories.
                      Policies can be self-access only, allowlist-based, or time-locked.
                    </Text>
                  </div>
                </Group>
              </Paper>
              
              <AccessControlManager />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="timelock" pt="md">
            <Stack gap="md">
              <Paper p="md" withBorder bg="orange.0">
                <Group gap="sm">
                  <ThemeIcon color="orange" size="sm">
                    <IconClock size={14} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={500}>Time-locked Content</Text>
                    <Text size="xs" c="dimmed">
                      Create memories that are encrypted and can only be decrypted after a specific time.
                      Perfect for future messages, time capsules, or delayed revelations.
                    </Text>
                  </div>
                </Group>
              </Paper>
              
              <TimelockManager />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="md">
            <Stack gap="md">
              <Paper p="md" withBorder bg="gray.0">
                <Group gap="sm">
                  <ThemeIcon color="gray" size="sm">
                    <IconSettings size={14} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={500}>Seal Configuration</Text>
                    <Text size="xs" c="dimmed">
                      View and manage your Seal encryption settings and session configuration.
                    </Text>
                  </div>
                </Group>
              </Paper>

              <Paper p="md" withBorder>
                <Stack gap="md">
                  <Title order={4}>Current Configuration</Title>
                  
                  <Group justify="space-between">
                    <Text size="sm">Network</Text>
                    <Badge variant="outline">Testnet</Badge>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm">Key Servers</Text>
                    <Badge variant="outline">2 Active</Badge>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm">Threshold Encryption</Text>
                    <Badge variant="outline">2-of-2</Badge>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm">Session TTL</Text>
                    <Badge variant="outline">30 minutes</Badge>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm">Cache Enabled</Text>
                    <Badge variant="outline" color="green">Yes</Badge>
                  </Group>
                </Stack>
              </Paper>

              <Paper p="md" withBorder>
                <Stack gap="md">
                  <Title order={4}>Security Features</Title>
                  
                  <Group gap="sm">
                    <ThemeIcon color="green" size="sm">
                      <IconKey size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={500}>Identity-Based Encryption</Text>
                      <Text size="xs" c="dimmed">
                        Each piece of data is encrypted with a unique identity-based key
                      </Text>
                    </div>
                  </Group>

                  <Group gap="sm">
                    <ThemeIcon color="blue" size="sm">
                      <IconShield size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={500}>Onchain Access Control</Text>
                      <Text size="xs" c="dimmed">
                        Access policies are enforced by smart contracts on Sui blockchain
                      </Text>
                    </div>
                  </Group>

                  <Group gap="sm">
                    <ThemeIcon color="orange" size="sm">
                      <IconClock size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={500}>Time-based Encryption</Text>
                      <Text size="xs" c="dimmed">
                        Content can be locked until specific times in the future
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
