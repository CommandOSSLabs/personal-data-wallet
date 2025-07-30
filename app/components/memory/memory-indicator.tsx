'use client'

import { useState, useEffect } from 'react'
import { Badge, Group, Text, Tooltip, ActionIcon } from '@mantine/core'
import { IconBrain, IconCheck, IconX } from '@tabler/icons-react'

interface MemoryIndicatorProps {
  isProcessing: boolean
  memoriesDetected: number
  memoriesStored: number
  errors: string[]
  onViewDetails?: () => void
}

export function MemoryIndicator({ 
  isProcessing, 
  memoriesDetected, 
  memoriesStored, 
  errors,
  onViewDetails 
}: MemoryIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Auto-hide details after 5 seconds
  useEffect(() => {
    if (memoriesStored > 0 || errors.length > 0) {
      setShowDetails(true)
      const timer = setTimeout(() => setShowDetails(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [memoriesStored, errors.length])

  if (!isProcessing && memoriesDetected === 0 && memoriesStored === 0 && errors.length === 0) {
    return null
  }

  const getStatusColor = () => {
    if (errors.length > 0) return 'red'
    if (memoriesStored > 0) return 'green'
    if (isProcessing) return 'blue'
    return 'gray'
  }

  const getStatusIcon = () => {
    if (errors.length > 0) return <IconX size={12} />
    if (memoriesStored > 0) return <IconCheck size={12} />
    return <IconBrain size={12} />
  }

  const getStatusText = () => {
    if (isProcessing) return 'Processing memories...'
    if (errors.length > 0) return `Memory error (${errors.length})`
    if (memoriesStored > 0) return `${memoriesStored} memories stored`
    if (memoriesDetected > 0) return `${memoriesDetected} memories detected`
    return 'Memory processing'
  }

  const getTooltipContent = () => {
    const parts = []
    
    if (memoriesDetected > 0) {
      parts.push(`Detected: ${memoriesDetected} potential memories`)
    }
    
    if (memoriesStored > 0) {
      parts.push(`Stored: ${memoriesStored} memories successfully`)
    }
    
    if (errors.length > 0) {
      parts.push(`Errors: ${errors.join(', ')}`)
    }
    
    return parts.join('\n') || 'Memory system active'
  }

  return (
    <Group gap="xs" align="center">
      <Tooltip 
        label={getTooltipContent()} 
        multiline 
        position="top"
        withArrow
      >
        <Badge
          size="sm"
          color={getStatusColor()}
          variant="light"
          leftSection={getStatusIcon()}
          style={{ cursor: onViewDetails ? 'pointer' : 'default' }}
          onClick={onViewDetails}
        >
          {getStatusText()}
        </Badge>
      </Tooltip>

      {showDetails && (memoriesStored > 0 || errors.length > 0) && (
        <Group gap="xs">
          {memoriesStored > 0 && (
            <Text size="xs" c="green">
              ✓ Personal information saved securely
            </Text>
          )}
          
          {errors.length > 0 && (
            <Text size="xs" c="red">
              ⚠ {errors.length} storage error{errors.length > 1 ? 's' : ''}
            </Text>
          )}
        </Group>
      )}
    </Group>
  )
}

// Hook for managing memory indicator state
export function useMemoryIndicator() {
  const [state, setState] = useState({
    isProcessing: false,
    memoriesDetected: 0,
    memoriesStored: 0,
    errors: [] as string[]
  })

  const startProcessing = () => {
    setState(prev => ({ ...prev, isProcessing: true }))
  }

  const setDetected = (count: number) => {
    setState(prev => ({ ...prev, memoriesDetected: count }))
  }

  const setStored = (count: number) => {
    setState(prev => ({ 
      ...prev, 
      memoriesStored: count, 
      isProcessing: false 
    }))
  }

  const addError = (error: string) => {
    setState(prev => ({ 
      ...prev, 
      errors: [...prev.errors, error],
      isProcessing: false 
    }))
  }

  const reset = () => {
    setState({
      isProcessing: false,
      memoriesDetected: 0,
      memoriesStored: 0,
      errors: []
    })
  }

  return {
    ...state,
    startProcessing,
    setDetected,
    setStored,
    addError,
    reset
  }
}
