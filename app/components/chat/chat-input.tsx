'use client'

import { useState } from 'react'
import {
  Group,
  TextInput,
  ActionIcon,
  Box,
  Loader
} from '@mantine/core'
import { IconSend } from '@tabler/icons-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
      <form onSubmit={handleSubmit}>
        <Group gap="sm" align="flex-end">
          <TextInput
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message Personal Data Wallet..."
            disabled={disabled || isLoading}
            style={{ flex: 1 }}
            size="md"
            radius="md"
          />
          <ActionIcon
            type="submit"
            disabled={disabled || isLoading || !message.trim()}
            size="lg"
            radius="md"
            variant="filled"
            color="blue"
          >
            {isLoading ? (
              <Loader size={16} />
            ) : (
              <IconSend size={16} />
            )}
          </ActionIcon>
        </Group>
      </form>
    </Box>
  )
}