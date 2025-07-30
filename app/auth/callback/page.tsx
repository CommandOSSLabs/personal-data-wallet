'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const { handleCallback, isAuthenticated } = useSuiAuth()

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract JWT from URL hash
        const hash = window.location.hash
        const params = new URLSearchParams(hash.substring(1))
        const idToken = params.get('id_token')

        if (idToken) {
          await handleCallback(idToken)
        } else {
          throw new Error('No ID token found in callback')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/?error=auth_failed')
      }
    }

    processCallback()
  }, [handleCallback, router])

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}