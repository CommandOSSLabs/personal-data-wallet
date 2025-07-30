'use client'

import { ChatInterface } from '@/app/components/chat/chat-interface'
import { LoginPage } from '@/app/components/auth/login-page'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { isAuthenticated, loading } = useSuiAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <ChatInterface />
}