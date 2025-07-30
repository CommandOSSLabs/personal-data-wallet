import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from './providers/query-provider'
import { SuiProvider } from './providers/sui-provider'
import { MantineProvider } from './providers/mantine-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Personal Data Wallet',
  description: 'Decentralized, Self-Organizing Memory Layer for LLMs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MantineProvider>
          <SuiProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </SuiProvider>
        </MantineProvider>
      </body>
    </html>
  )
}