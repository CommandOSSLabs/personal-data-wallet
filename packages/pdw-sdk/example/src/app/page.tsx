'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { CreateMemory } from '@/components/CreateMemory';
import { MemoryList } from '@/components/MemoryList';
import { RetrieveMemory } from '@/components/RetrieveMemory';

export default function Home() {
  const account = useCurrentAccount();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Personal Data Wallet
              </h1>
              <p className="text-slate-300">
                Decentralized memory system with AI embeddings, SEAL encryption and Walrus storage
              </p>
            </div>
            <ConnectButton />
          </div>
        </header>

        {!account ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-slate-300 mb-8">
                Please connect your Sui wallet to start using Personal Data Wallet
              </p>
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Actions */}
            <div className="space-y-8">
              <CreateMemory />
              <RetrieveMemory />
            </div>

            {/* Right Column - Memory List */}
            <div>
              <MemoryList />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
