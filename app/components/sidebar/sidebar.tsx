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
  Box,
  TextInput,
  Modal,
  Tooltip
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
  IconChevronRight,
  IconEdit,
  IconCheck,
  IconX,
  IconDownload,
  IconShare
} from '@tabler/icons-react'

interface SidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  memories: MemoryItem[]
  onNewChat: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onRenameSession?: (sessionId: string, newTitle: string) => void
  onClearMemories: () => void
}

export function Sidebar({
  sessions,
  currentSessionId,
  memories,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onClearMemories
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'chats' | 'memories'>('chats')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['facts']))
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const startEditing = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId)
    setEditingTitle(currentTitle)
  }

  const saveEdit = () => {
    if (editingSessionId && editingTitle.trim() && onRenameSession) {
      onRenameSession(editingSessionId, editingTitle.trim())
    }
    setEditingSessionId(null)
    setEditingTitle('')
  }

  const cancelEdit = () => {
    setEditingSessionId(null)
    setEditingTitle('')
  }

  const exportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      sessions: sessions.map(session => ({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: session.messages
      })),
      memories: memories.map(memory => ({
        id: memory.id,
        content: memory.content,
        category: memory.category,
        createdAt: memory.createdAt || new Date().toISOString()
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `personal-data-wallet-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
        <Stack gap="sm">
          <Button
            onClick={onNewChat}
            fullWidth
            leftSection={<IconPlus size={16} />}
            variant="light"
          >
            New Chat
          </Button>

          <Group grow>
            <Tooltip label="Export all data">
              <Button
                onClick={exportData}
                variant="subtle"
                size="sm"
                leftSection={<IconDownload size={14} />}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip label="Share session">
              <Button
                variant="subtle"
                size="sm"
                leftSection={<IconShare size={14} />}
                disabled
              >
                Share
              </Button>
            </Tooltip>
          </Group>
        </Stack>
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
                      cursor: editingSessionId === session.id ? 'default' : 'pointer',
                      backgroundColor: currentSessionId === session.id ? 'var(--mantine-color-gray-1)' : 'transparent'
                    }}
                    onClick={() => editingSessionId !== session.id && onSelectSession(session.id)}
                    className={editingSessionId !== session.id ? "hover:bg-gray-50" : ""}
                  >
                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                      {editingSessionId === session.id ? (
                        <TextInput
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          size="sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          autoFocus
                          onBlur={saveEdit}
                        />
                      ) : (
                        <Text size="sm" fw={500} truncate>
                          {session.title}
                        </Text>
                      )}
                      <Group gap="xs">
                        <IconClock size={12} />
                        <Text size="xs" c="dimmed">
                          {session.updatedAt.toLocaleDateString()}
                        </Text>
                      </Group>
                    </Stack>

                    <Group gap="xs">
                      {editingSessionId === session.id ? (
                        <>
                          <Tooltip label="Save">
                            <ActionIcon
                              variant="subtle"
                              color="green"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                saveEdit()
                              }}
                            >
                              <IconCheck size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Cancel">
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                cancelEdit()
                              }}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          {onRenameSession && (
                            <Tooltip label="Rename">
                              <ActionIcon
                                variant="subtle"
                                color="blue"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditing(session.id, session.title)
                                }}
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          <Tooltip label="Delete">
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
                          </Tooltip>
                        </>
                      )}
                    </Group>
                  </Group>
                ))
              )}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>
        <Tabs.Panel value="memories">
          <ScrollArea style={{ height: 'calc(100vh - 200px)' }}>
            <Stack gap="md" p="sm">
              {/* Enhanced Memory Stats */}
              <Box p="md" bg="gradient-to-br from-blue-50 to-indigo-50" style={{ borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--mantine-color-blue-2)' }}>
                <Group justify="space-between" mb="sm">
                  <Text size="sm" fw={600} c="blue.7">Memory Dashboard</Text>
                  <Badge size="xs" variant="light" color="blue">{memories.length} total</Badge>
                </Group>

                <Stack gap="xs">
                  <Group grow>
                    <Stack align="center" gap={2}>
                      <Text fw={700} size="lg" c="blue.8">{memories.length}</Text>
                      <Text size="xs" c="dimmed">Memories</Text>
                    </Stack>
                    <Stack align="center" gap={2}>
                      <Text fw={700} size="lg" c="green.8">{Object.keys(memoriesByCategory).length}</Text>
                      <Text size="xs" c="dimmed">Categories</Text>
                    </Stack>
                  </Group>

                  {/* Top Categories */}
                  {Object.keys(memoriesByCategory).length > 0 && (
                    <Box mt="xs">
                      <Text size="xs" c="dimmed" mb={4}>Top Categories:</Text>
                      <Group gap="xs">
                        {Object.entries(memoriesByCategory)
                          .sort(([,a], [,b]) => b.length - a.length)
                          .slice(0, 3)
                          .map(([category, items]) => (
                            <Badge
                              key={category}
                              size="xs"
                              variant="dot"
                              color={category === 'personal' ? 'blue' : category === 'work' ? 'green' : 'orange'}
                            >
                              {category} ({items.length})
                            </Badge>
                          ))
                        }
                      </Group>
                    </Box>
                  )}
                </Stack>
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