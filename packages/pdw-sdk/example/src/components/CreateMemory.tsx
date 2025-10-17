'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCreateMemory } from 'personal-data-wallet-sdk';

export function CreateMemory() {
  const account = useCurrentAccount();
  const [content, setContent] = useState('');

  const { mutate: createMemory, isPending, progress, error, isSuccess } = useCreateMemory({
    config: {
      packageId: process.env.NEXT_PUBLIC_PACKAGE_ID!,
      accessRegistryId: process.env.NEXT_PUBLIC_ACCESS_REGISTRY_ID!,
      walrusAggregator: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR!,
      geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
    },
    onSuccess: (result) => {
      console.log('✅ Memory created! Blob ID:', result.blobId);
      setContent('');
    },
    onError: (error) => {
      console.error('❌ Error creating memory:', error);
    },
    onProgress: (progress) => {
      console.log('📍', progress.message);
    }
  });

  const handleCreate = () => {
    console.log('\n🚀 ========== Starting Memory Creation ==========');

    if (!content.trim()) {
      return;
    }

    if (!account) {
      return;
    }

    createMemory({
      content,
      category: 'general'
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">Create Memory</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Memory Content
          </label>
          <textarea
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={4}
            placeholder="Enter your memory content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={isPending || !content.trim() || !account}
          className="w-full bg-primary hover:bg-primary/80 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isPending ? 'Creating...' : 'Create Memory'}
        </button>

        {!account && (
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-sm text-yellow-300">Please connect your wallet</p>
          </div>
        )}

        {progress && (
          <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <p className="text-sm text-blue-300">{progress.message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-300">Error: {error.message}</p>
          </div>
        )}

        {isSuccess && !isPending && (
          <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-sm text-green-300">Memory created successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}
