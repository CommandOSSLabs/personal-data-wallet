'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@suiet/wallet-kit'
import { memoryIndexService, MemoryIndexState } from '@/app/services/memoryIndexService'

export interface UseMemoryIndexReturn {
  indexState: MemoryIndexState | null
  isLoading: boolean
  error: string | null
  ensureIndex: () => Promise<string | null>
  checkIndex: () => Promise<void>
  clearIndex: () => void
  hasIndex: boolean
  indexId: string | null
}

/**
 * Hook for managing memory indexes
 * Provides automatic index creation and state management
 */
export function useMemoryIndex(): UseMemoryIndexReturn {
  const wallet = useWallet()
  const [indexState, setIndexState] = useState<MemoryIndexState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userAddress = wallet.account?.address

  // Load initial state when wallet connects
  useEffect(() => {
    if (userAddress) {
      const state = memoryIndexService.getIndexState(userAddress)
      setIndexState(state)
    } else {
      setIndexState(null)
    }
  }, [userAddress])

  /**
   * Ensure the user has a memory index
   */
  const ensureIndex = useCallback(async (): Promise<string | null> => {
    if (!wallet.connected || !userAddress) {
      setError('Wallet not connected')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const indexId = await memoryIndexService.ensureMemoryIndex(userAddress, wallet)
      
      if (indexId) {
        // Reload state after successful creation
        const newState = memoryIndexService.getIndexState(userAddress)
        setIndexState(newState)
        return indexId
      } else {
        setError('Failed to create memory index')
        return null
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [wallet, userAddress])

  /**
   * Check if user has an index and create if needed
   */
  const checkIndex = useCallback(async (): Promise<void> => {
    if (!wallet.connected || !userAddress) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await memoryIndexService.checkAndCreateIndex(userAddress, wallet)
      
      if (result.hasIndex) {
        // Update state
        const newState = memoryIndexService.getIndexState(userAddress)
        setIndexState(newState)
      } else if (result.message) {
        setError(result.message)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [wallet, userAddress])

  /**
   * Clear the index state for the current user
   */
  const clearIndex = useCallback(() => {
    if (userAddress) {
      memoryIndexService.clearIndexState(userAddress)
      setIndexState(null)
      setError(null)
    }
  }, [userAddress])

  return {
    indexState,
    isLoading,
    error,
    ensureIndex,
    checkIndex,
    clearIndex,
    hasIndex: !!indexState?.indexId && indexState.isRegistered,
    indexId: indexState?.indexId || null
  }
}
