'use client'

import { useState, useEffect } from 'react'
import { useCurrentAccount, useConnectWallet, useDisconnectWallet, useSuiClient } from '@mysten/dapp-kit'

const DEV_MODE = process.env.NODE_ENV === 'development'

interface AuthState {
  isAuthenticated: boolean
  userAddress: string | null
  loading: boolean
  error: string | null
}

export function useSuiAuth() {
  const currentAccount = useCurrentAccount()
  const { mutate: connect } = useConnectWallet()
  const { mutate: disconnect } = useDisconnectWallet()
  const suiClient = useSuiClient()
  
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userAddress: null,
    loading: true,
    error: null
  })

  // Update auth state when wallet connection changes
  useEffect(() => {
    if (currentAccount) {
      setAuthState({
        isAuthenticated: true,
        userAddress: currentAccount.address,
        loading: false,
        error: null
      })
    } else {
      // Check dev mode fallback
      const devAddress = localStorage.getItem('dev-sui-address')
      if (DEV_MODE && devAddress) {
        setAuthState({
          isAuthenticated: true,
          userAddress: devAddress,
          loading: false,
          error: null
        })
      } else {
        setAuthState({
          isAuthenticated: false,
          userAddress: null,
          loading: false,
          error: null
        })
      }
    }
  }, [currentAccount])

  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      // Development mode - skip wallet connection
      if (DEV_MODE && !currentAccount) {
        // Simulate a user address for development
        const devAddress = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        
        localStorage.setItem('dev-sui-address', devAddress)
        
        setAuthState({
          isAuthenticated: true,
          userAddress: devAddress,
          loading: false,
          error: null
        })
        return
      }

      // Connect wallet if not already connected
      if (!currentAccount) {
        connect(
          { wallet: { name: 'Sui Wallet' } as any },
          {
            onSuccess: () => {
              console.log('Wallet connected successfully')
            },
            onError: (error) => {
              console.error('Wallet connection failed:', error)
              setAuthState(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to connect wallet'
              }))
            }
          }
        )
      }

    } catch (error) {
      console.error('Login error:', error)
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }))
    }
  }

  const handleCallback = async (jwt: string) => {
    // Not needed for wallet connection
    return Promise.resolve()
  }

  const logout = () => {
    if (currentAccount) {
      disconnect()
    }
    
    localStorage.removeItem('dev-sui-address')
    
    setAuthState({
      isAuthenticated: false,
      userAddress: null,
      loading: false,
      error: null
    })
  }

  const getUserId = (): string => {
    return authState.userAddress || 'default-user'
  }

  return {
    ...authState,
    login,
    logout,
    handleCallback,
    getUserId,
    suiClient
  }
}