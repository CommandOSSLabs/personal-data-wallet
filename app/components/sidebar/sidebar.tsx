'use client'

import { useState } from 'react'
import { ChatSession, MemoryItem } from '@/app/types'
import {
  Stack,
  Button,
  Tabs,
  ScrollArea,
  Group,
  Text,
  ActionIcon,
  Collapse,
  Badge,
  Divider,
  Box
} from '@mantine/core'
import {
  IconMessageCircle,
  IconPlus,
  IconTrash,
  IconBrain,
  IconClock,
  IconTag,
  IconSearch,
  IconChevronDown,
  IconChevronRight
} from '@tabler/icons-react'

interface SidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  memories: MemoryItem[]
  onNewChat: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onClearMemories: () => void
}

export function Sidebar({ 
  sessions, 
  currentSessionId, 
  memories,
  onNewChat, 
  onSelectSession, 
  onDeleteSession,
  onClearMemories
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'chats' | 'memories'>('chats')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['facts']))

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Group memories by category
  const memoriesByCategory = memories.reduce((acc, memory) => {
    if (!acc[memory.category]) {
      acc[memory.category] = []
    }
    acc[memory.category].push(memory)
    return acc
  }, {} as Record<string, MemoryItem[]>)

  return (
    <Stack h="100%" gap={0}>
      {/* Header */}
      <Box p="md">
        <Button
          onClick={onNewChat}
          fullWidth
          leftSection={<IconPlus size={16} />}
          variant="light"
        >
          New Chat
        </Button>
      </Box>

      <Divider />

      {/* Tab Navigation */}
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as 'chats' | 'memories')}>
        <Tabs.List grow>
          <Tabs.Tab value="chats" leftSection={<IconMessageCircle size={16} />}>
            Chats
          </Tabs.Tab>
          <Tabs.Tab value="memories" leftSection={<IconBrain size={16} />}>
            Memory
          </Tabs.Tab>
        </Tabs.List>

        {/* Content */}
        <Tabs.Panel value="chats">
          <ScrollArea style={{ height: 'calc(100vh - 200px)' }}>
            <Stack gap="xs" p="sm">
              {sessions.length === 0 ? (
                <Stack align="center" gap="sm" py="xl">
                  <IconMessageCircle size={32} opacity={0.5} />
                  <Text size="sm" c="dimmed">No chat history yet</Text>
                </Stack>
              ) : (
                sessions.map((session) => (
                  <Group
                    key={session.id}
                    justify="space-between"
                    p="sm"
                    style={{
                      borderRadius: 'var(--mantine-radius-md)',
                      cursor: 'pointer',
                      backgroundColor: currentSessionId === session.id ? 'var(--mantine-color-gray-1)' : 'transparent'
                    }}
                    onClick={() => onSelectSession(session.id)}
                    className="hover:bg-gray-50"
                  >
                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>
                        {session.title}
                      </Text>
                      <Group gap="xs">
                        <IconClock size={12} />
                        <Text size="xs" c="dimmed">
                          {session.updatedAt.toLocaleDateString()}
                        </Text>
                      </Group>
                    </Stack>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                ))
              )}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>
        <Tabs.Panel value="memories">
          <ScrollArea style={{ height: 'calc(100vh - 200px)' }}>
            <Stack gap="md" p="sm">
              {/* Memory Stats */}
              <Box p="md" bg="gray.0" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
                <Text size="sm" c="dimmed" mb="sm">Memory Overview</Text>
                <Group grow>
                  <Stack align="center" gap={2}>
                    <Text fw={600}>{memories.length}</Text>
                    <Text size="xs" c="dimmed">Total Items</Text>
                  </Stack>
                  <Stack align="center" gap={2}>
                    <Text fw={600}>{Object.keys(memoriesByCategory).length}</Text>
                    <Text size="xs" c="dimmed">Categories</Text>
                  </Stack>
                </Group>
              </Box>

              {/* Memory Categories */}
              {Object.keys(memoriesByCategory).length === 0 ? (
                <Stack align="center" gap="sm" py="xl">
                  <IconBrain size={32} opacity={0.5} />
                  <Text size="sm" c="dimmed">No memories stored yet</Text>
                </Stack>
              ) : (
                <Stack gap="xs">
                  {Object.entries(memoriesByCategory).map(([category, items]) => (
                    <Box key={category} style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}>
                      <Group
                        justify="space-between"
                        p="md"
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleCategory(category)}
                        className="hover:bg-gray-50"
                      >
                        <Group gap="sm">
                          <IconTag size={16} color="gray" />
                          <Text size="sm" fw={500} tt="capitalize">
                            {category}
                          </Text>
                          <Badge size="xs" variant="light">
                            {items.length}
                          </Badge>
                        </Group>
                        {expandedCategories.has(category) ? (
                          <IconChevronDown size={16} />
                        ) : (
                          <IconChevronRight size={16} />
                        )}
                      </Group>

                      <Collapse in={expandedCategories.has(category)}>
                        <Divider />
                        <Stack gap="xs" p="sm">
                          {items.map((memory) => (
                            <Box
                              key={memory.id}
                              p="sm"
                              bg="gray.0"
                              style={{ borderRadius: 'var(--mantine-radius-sm)' }}
                            >
                              <Text size="xs" fw={500} mb="xs">
                                {memory.content.substring(0, 100)}
                                {memory.content.length > 100 && '...'}
                              </Text>
                              <Group justify="space-between">
                                <Badge size="xs" variant="dot" tt="capitalize">
                                  {memory.type}
                                </Badge>
                                <Text size="xs" c="dimmed">
                                  {memory?.createdAt?.toLocaleDateString()}
                                </Text>
                              </Group>
                            </Box>
                          ))}
                        </Stack>
                      </Collapse>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Memory Actions */}
              {memories.length > 0 && (
                <>
                  <Divider />
                  <Button
                    onClick={onClearMemories}
                    variant="light"
                    color="red"
                    size="sm"
                    fullWidth
                    leftSection={<IconTrash size={16} />}
                  >
                    Clear All Memories
                  </Button>
                </>
              )}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}