'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@suiet/wallet-kit'
import {
  Stack,
  Button,
  Text,
  Alert,
  Paper,
  Group,
  ThemeIcon,
  Progress,
  Badge,
  Loader
} from '@mantine/core'
import { IconShield, IconKey, IconCheck, IconX, IconClock } from '@tabler/icons-react'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'

interface SealSession {
  sessionId: string
  personalMessage: string
  expiresAt: string
  signed: boolean
  expired: boolean
}

interface SealAuthComponentProps {
  onSessionReady?: (sessionId: string) => void
  onError?: (error: string) => void
  packageId?: string
  ttlMinutes?: number
}

export function SealAuthComponent({ 
  onSessionReady, 
  onError, 
  packageId,
  ttlMinutes = 10 
}: SealAuthComponentProps) {
  const { wallet } = useSuiAuth()
  const { userAddress, isAuthenticated } = useSuiAuth()
  
  const [sealSession, setSealSession] = useState<SealSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'idle' | 'creating' | 'signing' | 'verifying' | 'ready'>('idle')

  // Check for existing session on mount
  useEffect(() => {
    if (isAuthenticated && userAddress) {
      checkExistingSession()
    }
  }, [isAuthenticated, userAddress])

  const checkExistingSession = async () => {
    if (!userAddress) return

    try {
      // Check if we have a stored session ID
      const storedSessionId = localStorage.getItem(`seal-session-${userAddress}`)
      if (!storedSessionId) return

      // Check session status
      const response = await fetch(`/api/seal/session/status/${storedSessionId}`)
      if (!response.ok) return

      const status = await response.json()
      
      if (status.exists && status.signed && !status.expired) {
        setSealSession({
          sessionId: storedSessionId,
          personalMessage: '',
          expiresAt: status.expiresAt,
          signed: true,
          expired: false
        })
        setStep('ready')
        onSessionReady?.(storedSessionId)
      } else {
        // Clean up invalid session
        localStorage.removeItem(`seal-session-${userAddress}`)
      }
    } catch (error) {
      console.error('Error checking existing session:', error)
    }
  }

  const createSession = async () => {
    if (!userAddress || !isAuthenticated) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)
    setStep('creating')

    try {
      // Create session request
      const response = await fetch('/api/seal/session/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          packageId,
          ttlMinutes,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`)
      }

      const sessionData = await response.json()
      
      setSealSession({
        sessionId: sessionData.sessionId,
        personalMessage: sessionData.personalMessage,
        expiresAt: sessionData.expiresAt,
        signed: false,
        expired: false
      })

      // Store session ID
      localStorage.setItem(`seal-session-${userAddress}`, sessionData.sessionId)
      
      setStep('signing')
      
      // Automatically proceed to signing
      await signSession(sessionData.sessionId, sessionData.personalMessage)

    } catch (error) {
      console.error('Error creating session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session'
      setError(errorMessage)
      onError?.(errorMessage)
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  const signSession = async (sessionId: string, personalMessage: string) => {
    if (!wallet || !userAddress) {
      setError('Wallet not connected')
      return
    }

    setStep('signing')
    setLoading(true)

    try {
      // Decode the base64 personal message
      const messageBytes = new Uint8Array(Buffer.from(personalMessage, 'base64'))
      
      // Sign the personal message with the wallet
      const signResult = await wallet.signPersonalMessage({
        message: messageBytes
      })

      if (!signResult || !signResult.signature) {
        throw new Error('Failed to sign message')
      }

      setStep('verifying')

      // Send signature to backend for verification
      const response = await fetch(`/api/seal/session/verify/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          signature: signResult.signature,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to verify session: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setSealSession(prev => prev ? { ...prev, signed: true } : null)
        setStep('ready')
        onSessionReady?.(sessionId)
      } else {
        throw new Error('Session verification failed')
      }

    } catch (error) {
      console.error('Error signing session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign session'
      setError(errorMessage)
      onError?.(errorMessage)
      setStep('idle')
      
      // Clean up failed session
      localStorage.removeItem(`seal-session-${userAddress}`)
      setSealSession(null)
    } finally {
      setLoading(false)
    }
  }

  const resetSession = () => {
    if (userAddress) {
      localStorage.removeItem(`seal-session-${userAddress}`)
    }
    setSealSession(null)
    setError(null)
    setStep('idle')
  }

  const getStepProgress = () => {
    switch (step) {
      case 'idle': return 0
      case 'creating': return 25
      case 'signing': return 50
      case 'verifying': return 75
      case 'ready': return 100
      default: return 0
    }
  }

  const getStepLabel = () => {
    switch (step) {
      case 'idle': return 'Ready to create session'
      case 'creating': return 'Creating session key...'
      case 'signing': return 'Please sign the message in your wallet'
      case 'verifying': return 'Verifying signature...'
      case 'ready': return 'Session ready for encryption'
      default: return 'Unknown state'
    }
  }

  if (!isAuthenticated) {
    return (
      <Alert color="blue" icon={<IconKey size={16} />}>
        Please connect your wallet to use Seal encryption
      </Alert>
    )
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            <ThemeIcon color="blue" size="sm">
              <IconShield size={14} />
            </ThemeIcon>
            <Text size="sm" fw={500}>Seal Authentication</Text>
          </Group>
          
          {sealSession && (
            <Badge 
              color={step === 'ready' ? 'green' : 'blue'} 
              variant="light"
              leftSection={step === 'ready' ? <IconCheck size={12} /> : <IconClock size={12} />}
            >
              {step === 'ready' ? 'Active' : 'Setting up'}
            </Badge>
          )}
        </Group>

        {/* Progress Bar */}
        <Stack gap="xs">
          <Progress value={getStepProgress()} size="sm" />
          <Text size="xs" c="dimmed">{getStepLabel()}</Text>
        </Stack>

        {/* Error Display */}
        {error && (
          <Alert color="red" icon={<IconX size={16} />}>
            {error}
          </Alert>
        )}

        {/* Session Info */}
        {sealSession && (
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              Session ID: {sealSession.sessionId.slice(0, 20)}...
            </Text>
            <Text size="xs" c="dimmed">
              Expires: {new Date(sealSession.expiresAt).toLocaleString()}
            </Text>
          </Stack>
        )}

        {/* Action Buttons */}
        <Group justify="flex-end">
          {step === 'idle' && (
            <Button 
              onClick={createSession} 
              loading={loading}
              leftSection={<IconKey size={16} />}
            >
              Create Session
            </Button>
          )}
          
          {step === 'ready' && (
            <Button 
              variant="outline" 
              onClick={resetSession}
              size="sm"
            >
              Reset Session
            </Button>
          )}
          
          {loading && step !== 'idle' && (
            <Group gap="xs">
              <Loader size="sm" />
              <Text size="sm">Processing...</Text>
            </Group>
          )}
        </Group>
      </Stack>
    </Paper>
  )
}
