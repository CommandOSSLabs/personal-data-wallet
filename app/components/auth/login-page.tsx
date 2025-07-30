'use client'

import { useSuiAuth } from '@/app/hooks/use-sui-auth'
import { useWallets } from '@mysten/dapp-kit'
import { Wallet, LogIn, Loader2 } from 'lucide-react'

export function LoginPage() {
  const { login, loading, error } = useSuiAuth()
  const wallets = useWallets()
  const isDev = process.env.NODE_ENV === 'development'
  const hasSuiWallet = wallets.some(wallet => wallet.name.includes('Sui'))

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Personal Data Wallet
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your decentralized memory layer powered by Sui
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              onClick={login}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  {isDev ? 'Continue (Dev Mode)' : hasSuiWallet ? 'Connect Sui Wallet' : 'Continue (Dev Mode)'}
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            {isDev && !hasSuiWallet ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-xs text-yellow-800 font-medium">Development Mode</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Install Sui Wallet extension or use dev mode for testing
                </p>
              </div>
            ) : hasSuiWallet ? (
              <>
                <p className="text-xs text-gray-500">
                  Connect your Sui wallet to continue
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Your data stays private and decentralized
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">
                  Secure authentication powered by Sui
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Your data stays private and decentralized
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Features</h3>
            <div className="grid grid-cols-1 gap-3 text-xs text-gray-600">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Decentralized memory storage
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                AI-powered knowledge graphs
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                Chat history and memory management
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}