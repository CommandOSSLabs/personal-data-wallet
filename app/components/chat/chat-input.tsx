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
  onInputChange?: (message: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function ChatInput({ onSendMessage, onInputChange, isLoading, disabled }: ChatInputProps) {
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
    <Box p="md" style={{ 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderTop: '1px solid #e2e8f0',
      backdropFilter: 'blur(10px)'
    }}>
      <form onSubmit={handleSubmit}>
        <Group gap="sm" align="flex-end">
          <TextInput
            value={message}
            onChange={(e) => {
              const newValue = e.target.value;
              setMessage(newValue);
              if (onInputChange) {
                onInputChange(newValue);
              }
            }}
            onKeyDown={handleKeyPress}
            placeholder="💭 Ask me anything or share personal information..."
            disabled={disabled || isLoading}
            style={{ 
              flex: 1,
            }}
            styles={{
              input: {
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '12px 16px',
                fontSize: '14px',
                '&:focus': {
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }
              }
            }}
            size="md"
          />
          <ActionIcon
            type="submit"
            size="lg"
            disabled={!message.trim() || isLoading || disabled}
            variant="gradient"
            gradient={{ from: 'cyan', to: 'indigo' }}
            radius="xl"
            style={{
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transform: (!message.trim() || isLoading || disabled) ? 'scale(0.95)' : 'scale(1)',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? <Loader size="sm" color="white" /> : <IconSend size={18} />}
          </ActionIcon>
        </Group>
      </form>
    </Box>
  )
}