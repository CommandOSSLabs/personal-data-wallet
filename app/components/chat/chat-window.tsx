'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/app/types'
import { MessageComponent } from './message'
import {
  ScrollArea,
  Stack,
  Center,
  ThemeIcon,
  Title,
  Text,
  Box
} from '@mantine/core'
import { IconMessageCircle } from '@tabler/icons-react'

interface ChatWindowProps {
  messages: Message[]
  isLoading?: boolean
  streamingMessageId?: string | null
  streamingContent?: string
  userAddress?: string
}

export function ChatWindow({ messages, isLoading, streamingMessageId, streamingContent, userAddress }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  return (
    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {messages.length === 0 ? (
        <Center style={{ flex: 1 }}>
          <Stack align="center" gap="lg" maw={400}>
            <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
              <IconMessageCircle size={32} />
            </ThemeIcon>
            <Stack align="center" gap="sm">
              <Title order={2} ta="center">How can I help you today?</Title>
              <Text c="dimmed" ta="center">
                I'm your personal data wallet. I can store information and answer questions about what you've shared with me.
              </Text>
            </Stack>
          </Stack>
        </Center>
      ) : (
        <ScrollArea style={{ flex: 1 }} p="md">
          <Stack gap="md">
            {messages.map((message) => {
              // If this is the streaming message, show the streaming content
              if (streamingMessageId && message.id === streamingMessageId && streamingContent !== null) {
                return (
                  <MessageComponent
                    key={message.id}
                    message={{
                      ...message,
                      content: streamingContent || ''
                    }}
                    isStreaming={true}
                    userAddress={userAddress}
                  />
                )
              }
              return <MessageComponent key={message.id} message={message} userAddress={userAddress} />
            })}
            {isLoading && !streamingMessageId && (
              <MessageComponent
                message={{
                  id: 'loading',
                  content: '',
                  type: 'assistant',
                  timestamp: new Date()
                }}
                isTyping={true}
              />
            )}
          </Stack>
          <div ref={messagesEndRef} />
        </ScrollArea>
      )}
    </Box>
  )
}