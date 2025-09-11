'use client'

import { useEffect, useState } from 'react'
import { Badge, Button, Group, Text, Tooltip } from '@mantine/core'
import { IconDroplet, IconWallet } from '@tabler/icons-react'
import { useWallet } from '@suiet/wallet-kit'
import { SuiClient } from '@mysten/sui/client'

export function WalletBalance() {
  const wallet = useWallet()
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)

  const fetchBalance = async () => {
    if (!wallet.connected || !wallet.account) return
    
    setLoading(true)
    try {
      const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' })
      const balanceData = await client.getBalance({
        owner: wallet.account.address,
        coinType: '0x2::sui::SUI'
      })
      
      // Convert from MIST to SUI (9 decimal places)
      const suiBalance = Number(balanceData.totalBalance) / 1_000_000_000
      setBalance(suiBalance.toFixed(4))
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      setBalance('0')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [wallet.connected, wallet.account])

  const openFaucet = () => {
    window.open('https://suifaucet.com', '_blank')
  }

  if (!wallet.connected) return null

  const needsGas = parseFloat(balance) < 0.1

  return (
    <Group gap="xs">
      <Tooltip label={needsGas ? "You need SUI for gas fees" : "Your SUI balance"}>
        <Badge
          leftSection={<IconWallet size={14} />}
          variant={needsGas ? "light" : "filled"}
          color={needsGas ? "yellow" : "blue"}
          size="lg"
        >
          {loading ? '...' : `${balance} SUI`}
        </Badge>
      </Tooltip>
      
      {needsGas && (
        <Button
          size="xs"
          variant="subtle"
          leftSection={<IconDroplet size={14} />}
          onClick={openFaucet}
        >
          Get SUI
        </Button>
      )}
    </Group>
  )
}