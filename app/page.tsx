'use client'

import { ChatInterface } from '@/app/components/chat/chat-interface'
import { LoginPage } from '@/app/components/auth/login-page'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { Center, Loader, Text, Stack } from '@mantine/core'

export default function Home() {
  const { isAuthenticated, loading } = useSuiAuth()

  if (loading) {
    return (
      <Center h="100vh" bg="gray.0">
        <Stack align="center" gap="md">
          <Loader size="lg" color="blue" />
          <Text c="dimmed">Loading...</Text>
        </Stack>
      </Center>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <ChatInterface />
}