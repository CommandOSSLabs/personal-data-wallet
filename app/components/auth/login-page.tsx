'use client'

import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { ConnectButton } from '@suiet/wallet-kit'
import {
  Container,
  Paper,
  Stack,
  Title,
  Text,
  Alert,
  Group,
  ThemeIcon,
  Center
} from '@mantine/core'
import { IconWallet, IconShield, IconBrain, IconHistory } from '@tabler/icons-react'

export function LoginPage() {
  const { error } = useSuiAuth()
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <Center h="100vh" bg="gray.0">
      <Container size="xs">
        <Paper shadow="md" p="xl" radius="md">
          <Stack align="center" gap="lg">
            {/* Header */}
            <Stack align="center" gap="sm">
              <ThemeIcon size="xl" radius="xl" color="blue">
                <IconWallet size={24} />
              </ThemeIcon>
              <Title order={2} ta="center">
                Personal Data Wallet
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                Your decentralized memory layer powered by Sui
              </Text>
            </Stack>

            {/* Error Alert */}
            {error && (
              <Alert color="red" radius="md" w="100%">
                {error}
              </Alert>
            )}

            {/* Connect Button */}
            <ConnectButton style={{ width: '100%' }}>
              Connect Wallet
            </ConnectButton>

            {/* Development Mode Info */}
            {isDev ? (
              <Alert color="yellow" radius="md" w="100%">
                <Stack gap="xs">
                  <Text size="sm" fw={500}>Development Mode</Text>
                  <Text size="xs">
                    Connect any supported Sui wallet or use dev mode for testing
                  </Text>
                </Stack>
              </Alert>
            ) : (
              <Stack align="center" gap="xs">
                <Text size="xs" c="dimmed" ta="center">
                  Connect your Sui wallet to continue
                </Text>
                <Text size="xs" c="dimmed" ta="center">
                  Supports Sui Wallet, Suiet, Ethos, and more
                </Text>
              </Stack>
            )}

            {/* Features */}
            <Stack gap="md" w="100%" mt="md">
              <Text size="sm" fw={500} ta="center">Features</Text>
              <Stack gap="sm">
                <Group gap="sm" justify="center">
                  <ThemeIcon size="sm" color="green" radius="xl">
                    <IconShield size={12} />
                  </ThemeIcon>
                  <Text size="xs">Decentralized memory storage</Text>
                </Group>
                <Group gap="sm" justify="center">
                  <ThemeIcon size="sm" color="blue" radius="xl">
                    <IconBrain size={12} />
                  </ThemeIcon>
                  <Text size="xs">AI-powered knowledge graphs</Text>
                </Group>
                <Group gap="sm" justify="center">
                  <ThemeIcon size="sm" color="violet" radius="xl">
                    <IconHistory size={12} />
                  </ThemeIcon>
                  <Text size="xs">Chat history and memory management</Text>
                </Group>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Center>
  )
}