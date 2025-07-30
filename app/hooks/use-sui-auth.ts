'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@suiet/wallet-kit'

const DEV_MODE = process.env.NODE_ENV === 'development'

interface AuthState {
  isAuthenticated: boolean
  userAddress: string | null
  loading: boolean
  error: string | null
}

export function useSuiAuth() {
  const wallet = useWallet()
  
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userAddress: null,
    loading: true,
    error: null
  })

  // Update auth state when wallet connection changes
  useEffect(() => {
    if (wallet.connected && wallet.account) {
      setAuthState({
        isAuthenticated: true,
        userAddress: wallet.account.address,
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
  }, [wallet.connected, wallet.account])

  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      // Development mode - skip wallet connection
      if (DEV_MODE && !wallet.connected) {
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
      if (!wallet.connected) {
        try {
          await wallet.select('Sui Wallet')
          console.log('Wallet connected successfully')
        } catch (error) {
          console.error('Wallet connection failed:', error)
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to connect wallet'
          }))
        }
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

  const handleCallback = async (_jwt: string) => {
    // Not needed for wallet connection
    return Promise.resolve()
  }

  const logout = () => {
    if (wallet.connected) {
      wallet.disconnect()
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
    wallet
  }
}