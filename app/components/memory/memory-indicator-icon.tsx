'use client'

import { IconBrain, IconPlus } from '@tabler/icons-react'
import { Tooltip, ActionIcon } from '@mantine/core'

interface MemoryIndicatorIconProps {
  memoryDetected: boolean
  memoryId?: string | null
  onClick?: () => void
  size?: number
}

export function MemoryIndicatorIcon({ 
  memoryDetected, 
  memoryId, 
  onClick, 
  size = 16 
}: MemoryIndicatorIconProps) {
  if (!memoryDetected) return null

  const isStored = !!memoryId
  const icon = isStored ? (
    <IconBrain 
      size={size} 
      style={{ 
        color: '#4CAF50',
        filter: 'drop-shadow(0 0 4px rgba(76, 175, 80, 0.3))'
      }} 
    />
  ) : (
    <IconPlus 
      size={size} 
      style={{ 
        color: '#2196F3',
        filter: 'drop-shadow(0 0 4px rgba(33, 150, 243, 0.3))'
      }} 
    />
  )

  const tooltipText = isStored 
    ? 'Memory stored - Click to view details' 
    : 'Personal information detected - Click to add to memory'

  return (
    <Tooltip label={tooltipText} position="top" withArrow>
      <ActionIcon
        variant="subtle"
        size="sm"
        onClick={onClick}
        style={{
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.05)'
          }
        }}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  )
}