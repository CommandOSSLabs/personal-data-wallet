'use client'

import { Message } from '@/app/types'
import { MarkdownRenderer } from './markdown-renderer'
import { MemoryExtractionIndicator } from '@/app/components/memory/memory-extraction-indicator'
import {
  Group,
  Avatar,
  Paper,
  Text,
  Box,
  Loader,
  Stack
} from '@mantine/core'
import { IconUser, IconRobot } from '@tabler/icons-react'

interface MessageProps {
  message: Message
  isTyping?: boolean
  isStreaming?: boolean
  userAddress?: string
}

export function MessageComponent({ message, isTyping = false, isStreaming = false, userAddress }: MessageProps) {
  const isUser = message.type === 'user'

  return (
    <Group
      align="flex-start"
      gap="sm"
      justify={isUser ? 'flex-end' : 'flex-start'}
      wrap="nowrap"
    >
      {!isUser && (
        <Avatar
          color="blue"
          radius="xl"
          size="sm"
        >
          <IconRobot size={16} />
        </Avatar>
      )}

      <Paper
        p="md"
        radius="md"
        shadow="xs"
        style={{
          maxWidth: '80%',
          backgroundColor: isUser ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-1)',
          color: isUser ? 'white' : 'var(--mantine-color-dark-7)'
        }}
      >
        {isTyping ? (
          <Group gap="xs" align="center">
            <Loader size="xs" />
            <Text size="sm" c="dimmed">Thinking...</Text>
          </Group>
        ) : (
          <Box>
            {isUser ? (
              <Stack gap="xs">
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Text>
                {userAddress && (
                  <Group justify="flex-end">
                    <MemoryExtractionIndicator
                      message={message.content}
                      userAddress={userAddress}
                      onMemoryStored={(count) => {
                        console.log(`Stored ${count} memories from message`)
                      }}
                    />
                  </Group>
                )}
              </Stack>
            ) : (
              <Box style={{ position: 'relative' }}>
                <MarkdownRenderer
                  content={message.content}
                  className="prose prose-sm max-w-none"
                />
                {isStreaming && (
                  <Text
                    component="span"
                    size="sm"
                    c="dimmed"
                    style={{
                      animation: 'pulse 1s infinite',
                      display: 'inline'
                    }}
                  >
                    ▋
                  </Text>
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {isUser && (
        <Avatar
          color="gray"
          radius="xl"
          size="sm"
        >
          <IconUser size={16} />
        </Avatar>
      )}
    </Group>
  )
}