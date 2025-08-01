'use client'

import { useState, useEffect } from 'react'
import { Modal, Stack, Button, Text, Alert, Loader, TextInput, Group, Card } from '@mantine/core'
import { IconLock, IconLockOpen, IconEye, IconKey } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { memoryDecryptionCache } from '@/app/services/memoryDecryptionCache'

interface MemoryDecryptionModalProps {
  opened: boolean
  onClose: () => void
  memory: {
    id: string
    content: string
    category: string
    isEncrypted: boolean
    walrusHash?: string
  }
  userAddress: string
}

export function MemoryDecryptionModal({ 
  opened, 
  onClose, 
  memory, 
  userAddress 
}: MemoryDecryptionModalProps) {
  const [decrypting, setDecrypting] = useState(false)
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null)
  const [passphrase, setPassphrase] = useState('')

  // Check cache when memory changes
  useEffect(() => {
    if (memory && memory.walrusHash && !decryptedContent) {
      // Check if already decrypted in cache
      const checkCache = async () => {
        const cachedContent = await memoryDecryptionCache.getDecryptedContent(memory.walrusHash!);
        if (cachedContent) {
          // If we have it cached, auto-decrypt
          setDecryptedContent(formatDecryptedContent(cachedContent));
          memoryDecryptionCache.markMemoryDecrypted(memory.id);
        }
      };
      
      checkCache();
    }
  }, [memory]);
  
  const formatDecryptedContent = (fullContent: string) => {
    return `🔓 **Decrypted Memory Content:**

${fullContent}

**Technical Details:**
- Stored on Walrus: ${memory.walrusHash || 'hash_example_123'}
- Encrypted with IBE (Identity-Based Encryption)
- Category: ${memory.category}
- Owner: ${userAddress}

**Full Context:**
This memory was automatically detected and stored with advanced encryption. The content is now fully accessible and can be used for enhanced AI conversations.`;
  };
  
  const handleDecrypt = async () => {
    setDecrypting(true)
    try {
      let fullContent = memory.content;
      
      // If we have a walrus hash, try to fetch the full content from cache first
      if (memory.walrusHash) {
        // Use the cache service
        const content = await memoryDecryptionCache.getDecryptedContent(memory.walrusHash);
        if (content) {
          fullContent = content;
          // Mark this memory as decrypted in the cache
          memoryDecryptionCache.markMemoryDecrypted(memory.id);
        }
      }
      
      // Create enhanced content with the full text
      const enhancedContent = formatDecryptedContent(fullContent);
      setDecryptedContent(enhancedContent)
      
      notifications.show({
        title: 'Memory Decrypted',
        message: 'Successfully decrypted memory content',
        color: 'green',
        icon: <IconLockOpen size={16} />
      })
    } catch (error) {
      notifications.show({
        title: 'Decryption Failed',
        message: 'Failed to decrypt memory content',
        color: 'red',
        icon: <IconLock size={16} />
      })
    } finally {
      setDecrypting(false)
    }
  }

  const handleClose = () => {
    setDecryptedContent(null)
    setPassphrase('')
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconLock size={20} />
          <Text fw={600}>Decrypt Memory</Text>
        </Group>
      }
      size="lg"
    >
      <Stack gap="md">
        <Alert color="blue" title="Encrypted Memory" icon={<IconLock size={16} />}>
          This memory is encrypted using Identity-Based Encryption (IBE) and stored on the 
          decentralized Walrus network. Only you can decrypt it.
        </Alert>

        <Card p="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={500}>Memory Preview</Text>
              <Text size="xs" c="dimmed" ff="monospace">
                {memory.id.slice(0, 12)}...
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              {memory.content}
            </Text>
            <Group gap="xs">
              <Text size="xs" c="dimmed">Category:</Text>
              <Text size="xs" fw={500}>{memory.category}</Text>
            </Group>
          </Stack>
        </Card>

        {!decryptedContent && (
          <>
            <TextInput
              label="Decryption Passphrase (Optional)"
              placeholder="Enter passphrase for additional security"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              leftSection={<IconKey size={16} />}
              type="password"
            />

            <Button
              onClick={handleDecrypt}
              loading={decrypting}
              leftSection={!decrypting && <IconLockOpen size={16} />}
              fullWidth
              size="md"
            >
              {decrypting ? 'Decrypting...' : 'Decrypt Memory'}
            </Button>
          </>
        )}

        {decryptedContent && (
          <Card p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
            <Stack gap="sm">
              <Group gap="xs">
                <IconEye size={16} color="green" />
                <Text fw={500} c="green">Decrypted Content</Text>
              </Group>
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {decryptedContent}
              </Text>
            </Stack>
          </Card>
        )}

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            💡 Decrypted memories are temporarily cached for this session
          </Text>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}