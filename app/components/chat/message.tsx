'use client'

import { useState } from 'react'
import { Message } from '@/app/types'
import { MarkdownRenderer } from './markdown-renderer'
import { MemoryExtractionIndicator } from '@/app/components/memory/memory-extraction-indicator'
import { MemoryIndicatorIcon } from '@/app/components/memory/memory-indicator-icon'
import { MemoryReviewModal } from '@/app/components/memory/memory-review-modal'
import { RelevantMemories } from './relevant-memories'
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
  const [memoryModalOpened, setMemoryModalOpened] = useState(false)

  return (
    <Group
      align="flex-start"
      gap="sm"
      justify={isUser ? 'flex-end' : 'flex-start'}
      wrap="nowrap"
    >
      {!isUser && (
        <Avatar
          radius="xl"
          size="sm"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <IconRobot size={16} />
        </Avatar>
      )}

      <Paper
        p="md"
        radius="lg"
        shadow="md"
        style={{
          maxWidth: '80%',
          background: isUser 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          color: isUser ? 'white' : 'var(--mantine-color-dark-7)',
          border: isUser ? 'none' : '1px solid #e2e8f0',
          boxShadow: isUser 
            ? '0 4px 16px rgba(102, 126, 234, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
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
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap', flex: 1 }}>
                    {message.content}
                  </Text>
                  {userAddress && (message.memoryDetected || message.memoryId) && (
                    <MemoryIndicatorIcon
                      memoryDetected={!!message.memoryDetected}
                      memoryId={message.memoryId}
                      onClick={() => setMemoryModalOpened(true)}
                      size={18}
                    />
                  )}
                </Group>
              </Stack>
            ) : (
              <Stack gap="xs">
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
                
                {/* Show relevant memories below assistant messages when not streaming */}
                {!isUser && !isStreaming && userAddress && (
                  <RelevantMemories
                    message={message.content}
                    userAddress={userAddress || ''}
                  />
                )}
              </Stack>
            )}
          </Box>
        )}
      </Paper>

      {isUser && (
        <Avatar
          radius="xl"
          size="sm"
          style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
            color: 'white'
          }}
        >
          <IconUser size={16} />
        </Avatar>
      )}

      {/* Memory Review Modal */}
      {userAddress && (
        <MemoryReviewModal
          opened={memoryModalOpened}
          onClose={() => setMemoryModalOpened(false)}
          messageContent={message.content}
          messageId={message.id}
          memoryId={message.memoryId}
          userAddress={userAddress}
        />
      )}
    </Group>
  )
}