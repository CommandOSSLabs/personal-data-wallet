'use client'

import { Button, Card, Stack, Text, Group, Code } from '@mantine/core'
import { memoryIndexService } from '@/app/services/memoryIndexService'
import { useWallet } from '@suiet/wallet-kit'
import { useState } from 'react'

export function MemoryIndexDebugPanel() {
  const wallet = useWallet()
  const [status, setStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  
  const userAddress = wallet.account?.address || ''
  const indexState = userAddress ? memoryIndexService.getIndexState(userAddress) : null
  
  const handleClearCache = () => {
    if (userAddress) {
      memoryIndexService.clearIndexState(userAddress)
      setStatus('Index cache cleared')
      setTimeout(() => setStatus(''), 3000)
    }
  }
  
  const handleCreateIndex = async () => {
    if (!userAddress || !wallet.connected) {
      setStatus('Please connect your wallet first')
      return
    }
    
    setIsLoading(true)
    setStatus('Creating memory index...')
    
    try {
      const result = await memoryIndexService.checkAndCreateIndex(userAddress, wallet)
      if (result.hasIndex) {
        setStatus(`Index ready: ${result.indexId || 'exists on backend'}`)
      } else {
        setStatus(`Failed: ${result.message}`)
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack spacing="sm">
        <Text size="lg" weight={500}>Memory Index Debug</Text>
        
        <Group spacing="xs">
          <Text size="sm">Address:</Text>
          <Code>{userAddress || 'Not connected'}</Code>
        </Group>
        
        {indexState && (
          <>
            <Group spacing="xs">
              <Text size="sm">Index ID:</Text>
              <Code>{indexState.indexId || 'None'}</Code>
            </Group>
            
            <Group spacing="xs">
              <Text size="sm">Status:</Text>
              <Text size="sm" color={indexState.isRegistered ? 'green' : 'yellow'}>
                {indexState.isCreating ? 'Creating...' : indexState.isRegistered ? 'Registered' : 'Not registered'}
              </Text>
            </Group>
            
            {indexState.lastError && (
              <Text size="sm" color="red">
                Last error: {indexState.lastError}
              </Text>
            )}
          </>
        )}
        
        {status && (
          <Text size="sm" color={status.includes('Error') || status.includes('Failed') ? 'red' : 'blue'}>
            {status}
          </Text>
        )}
        
        <Group>
          <Button 
            onClick={handleClearCache} 
            variant="outline" 
            size="sm"
            disabled={!userAddress}
          >
            Clear Cache
          </Button>
          
          <Button 
            onClick={handleCreateIndex} 
            size="sm"
            disabled={!userAddress || isLoading}
            loading={isLoading}
          >
            Create/Check Index
          </Button>
        </Group>
      </Stack>
    </Card>
  )
}
