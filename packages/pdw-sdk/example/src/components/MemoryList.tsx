'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCurrentAccount, useSuiClient, useSignPersonalMessage } from '@mysten/dapp-kit';
import { ClientMemoryManager } from 'personal-data-wallet-sdk/dist/client/ClientMemoryManager';

interface Memory {
  id: string;
  category: string;
  vectorId: number;
  blobId: string;
  content?: string;
  metadata: {
    contentType: string;
    contentSize: number;
    topic: string;
    importance: number;
    embeddingBlobId: string;
    embeddingDimension: number;
    createdTimestamp: number;
  };
}

export function MemoryList() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [decryptionStatus, setDecryptionStatus] = useState('');

  const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';

  // Initialize ClientMemoryManager
  const memoryManager = useMemo(() => {
    return new ClientMemoryManager({
      packageId: process.env.NEXT_PUBLIC_PACKAGE_ID || '',
      accessRegistryId: process.env.NEXT_PUBLIC_ACCESS_REGISTRY_ID || '',
      walrusAggregator: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || '',
      geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
    });
  }, []);

  const batchDecryptMemories = async (memoriesToDecrypt: Memory[]): Promise<void> => {
    if (!account) {
      console.error('No account connected');
      return;
    }

    if (memoriesToDecrypt.length === 0) {
      return;
    }

    try {
      const blobIds = memoriesToDecrypt.map(m => m.blobId);

      console.log('🔓 Starting batch decryption with SINGLE signature...');
      setDecryptionStatus('Initializing decryption (sign once)...');

      // Batch decrypt with SINGLE signature
      const results = await memoryManager.batchRetrieveMemories({
        blobIds,
        account,
        signPersonalMessage: signPersonalMessage as any,
        client: client as any,
        onProgress: (status, current, total) => {
          console.log(`📍 ${status} (${current}/${total})`);
          setDecryptionStatus(`${status} (${current}/${total})`);
        }
      });

      // Update memories with decrypted content
      setMemories(prev =>
        prev.map(memory => {
          const result = results.find(r => r.blobId === memory.blobId);
          if (result) {
            return {
              ...memory,
              content: result.content || result.error || 'Decryption failed'
            };
          }
          return memory;
        })
      );

      setDecryptionStatus('All memories decrypted!');
      setTimeout(() => setDecryptionStatus(''), 2000);
    } catch (error: any) {
      console.error('Batch decryption failed:', error);
      setDecryptionStatus(`Error: ${error.message}`);
      // Mark all as failed
      setMemories(prev =>
        prev.map(m => ({
          ...m,
          content: 'Batch decryption failed'
        }))
      );
    }
  };

  const loadMemories = async () => {
    console.log('\n📚 ========== Loading Memories ==========');

    if (!account?.address) {
      console.log('⚠️ No account connected');
      return;
    }

    console.log('👤 Account:', account.address);

    setIsLoading(true);
    setError('');

    try {
      console.log('📦 Package ID:', packageId);

      if (!packageId) {
        throw new Error('Package ID not configured');
      }

      console.log('🔍 Querying objects with StructType:', `${packageId}::memory::Memory`);

      const objects = await client.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: `${packageId}::memory::Memory`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      console.log('📡 Query response:', {
        total: objects.data.length,
        hasNextPage: objects.hasNextPage,
      });

      const loadedMemories: Memory[] = [];

      for (const obj of objects.data) {
        console.log('🔍 Processing object:', obj.data?.objectId);

        if (obj.data?.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any;

          console.log('📝 Memory fields:', {
            id: obj.data.objectId,
            category: fields.category,
            vectorId: fields.vector_id,
            blobId: fields.blob_id,
            metadata: fields.metadata,
          });

          const metadataFields = fields.metadata?.fields || fields.metadata;

          const memory: Memory = {
            id: obj.data.objectId,
            category: fields.category || 'general',
            vectorId: parseInt(fields.vector_id || '0'),
            blobId: fields.blob_id || '',
            metadata: {
              contentType: metadataFields?.content_type || '',
              contentSize: parseInt(metadataFields?.content_size || '0'),
              topic: metadataFields?.topic || '',
              importance: parseInt(metadataFields?.importance || '0'),
              embeddingBlobId: metadataFields?.embedding_blob_id || '',
              embeddingDimension: parseInt(metadataFields?.embedding_dimension || '0'),
              createdTimestamp: parseInt(metadataFields?.created_timestamp || '0'),
            },
          };

          loadedMemories.push(memory);
        }
      }

      // Sort by timestamp (newest first)
      loadedMemories.sort((a, b) => b.metadata.createdTimestamp - a.metadata.createdTimestamp);

      console.log('✅ Loaded', loadedMemories.length, 'memories');

      // Set memories first (without content)
      setMemories(loadedMemories);

      // Batch decrypt all memories with SINGLE signature
      if (loadedMemories.length > 0) {
        console.log('🔓 Will decrypt', loadedMemories.length, 'memories with 1 signature...');
        await batchDecryptMemories(loadedMemories);
      }

      console.log('🎉 ========== Loading Complete ==========\n');
    } catch (err: any) {
      console.error('❌ Error loading memories:', err);
      console.error('Stack:', err.stack);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [account?.address]);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Your Memories</h2>
        <button
          onClick={loadMemories}
          disabled={isLoading}
          className="bg-primary/20 hover:bg-primary/30 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {decryptionStatus && (
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
          <p className="text-sm text-blue-300">{decryptionStatus}</p>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-slate-300 mt-2">Loading memories...</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-300">No memories yet. Create your first one!</p>
          </div>
        ) : (
          memories.map((memory) => (
            <div
              key={memory.id}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {memory.metadata.topic || memory.category}
                  </h3>
                  <p className="text-sm text-slate-300 mb-2">
                    Category: {memory.category} • Vector ID: {memory.vectorId}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>
                      {new Date(memory.metadata.createdTimestamp).toLocaleDateString()}
                    </span>
                    <span>
                      Importance: {memory.metadata.importance}/10
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {memory.content ? (
                  <div className="text-sm text-slate-200 bg-white/5 rounded p-3 border border-white/10">
                    {memory.content}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    Decrypting...
                  </div>
                )}
                <div className="text-xs text-slate-500 font-mono break-all">
                  Blob: {memory.blobId.substring(0, 32)}...
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {memories.length > 0 && (
        <div className="mt-4 text-sm text-slate-400 text-center">
          {memories.length} {memories.length === 1 ? 'memory' : 'memories'} found
        </div>
      )}
    </div>
  );
}
