'use client'

import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { ChatInterface } from '@/app/components/chat/chat-interface'
import { LoginPage } from '@/app/components/auth/login-page'
import { Box, Container, Paper, Text, Alert, Group, Button } from '@mantine/core'
import { IconInfoCircle, IconWallet } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

export default function DirectPage() {
  const { isAuthenticated, loading, userAddress, login, wallet } = useSuiAuth()
  const [showInfoAlert, setShowInfoAlert] = useState(true)
  
  // Display wallet connection status
  useEffect(() => {
    if (wallet.connected) {
      console.log('Wallet connected:', wallet.account?.address)
    }
  }, [wallet.connected, wallet.account])
  
  if (loading) {
    return (
      <Container size="md" p="xl">
        <Paper shadow="md" p="xl" radius="md">
          <Text>Loading...</Text>
        </Paper>
      </Container>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Box className="h-screen flex flex-col">
      {showInfoAlert && (
        <Alert 
          icon={<IconInfoCircle size="1.1rem" />} 
          title="Direct Blockchain Interaction" 
          color="blue" 
          withCloseButton 
          onClose={() => setShowInfoAlert(false)}
          className="mb-2 mx-4 mt-2"
        >
          <Group>
                          <Text size="sm">
              Personal Data Wallet uses direct blockchain interactions with your wallet. All on-chain operations require your signature for maximum security and ownership.
            </Text>
            <Group>
              <IconWallet size="1.2rem" />
              <Text size="sm" fw={500}>Connected wallet: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}</Text>
            </Group>
          </Group>
          
        </Alert>
      )}
      
      <div className="flex-grow overflow-hidden">
        <ChatInterface />
      </div>
    </Box>
  )
}