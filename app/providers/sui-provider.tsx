'use client'

import { WalletProvider } from '@suiet/wallet-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@suiet/wallet-kit/style.css'

const queryClient = new QueryClient()

export function SuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider autoConnect={true} defaultNetwork="testnet">
        {children}
      </WalletProvider>
    </QueryClientProvider>
  )
}