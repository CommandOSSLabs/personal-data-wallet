'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient, useSignPersonalMessage } from '@mysten/dapp-kit';
import { SealClient, SessionKey } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';
import { fromHex } from '@mysten/sui/utils';

interface Memory {
  id: string;
  category: string;
  vectorId: number;
  blobId: string;
  content?: string; // Raw content text (before encryption)
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

  const walletRegistryId = process.env.NEXT_PUBLIC_WALLET_REGISTRY_ID || '';
  const pdwPackageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
  const walrusAggregator = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || '';

  // Shared session for batch decryption
  let sharedSessionKey: SessionKey | null = null;
  let sharedTxBytes: Uint8Array | null = null;
  let sharedSealClient: SealClient | null = null;

  const initializeSession = async () => {
    if (!account?.address) throw new Error('No wallet connected');

    console.log('🔑 Initializing shared session for batch decryption...');

    // Create SEAL client (reusable)
    const serverObjectIds = [
      '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
      '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8'
    ];

    sharedSealClient = new SealClient({
      suiClient: client,
      serverConfigs: serverObjectIds.map((id) => ({ objectId: id, weight: 1 })),
      verifyKeyServers: false,
    });

    // Create session key (reusable)
    sharedSessionKey = await SessionKey.create({
      address: account.address,
      packageId: pdwPackageId,
      ttlMin: 10,
      suiClient: client,
    });

    // Sign personal message ONCE
    const personalMessage = sharedSessionKey.getPersonalMessage();
    const signatureResult = await signPersonalMessage({ message: personalMessage });
    await sharedSessionKey.setPersonalMessageSignature(signatureResult.signature);

    // Build seal_approve transaction ONCE
    const tx = new Transaction();
    const addressHex = account.address.startsWith('0x') ? account.address.slice(2) : account.address;
    const idBytes = fromHex(addressHex);

    tx.moveCall({
      target: `${pdwPackageId}::seal_access_control::seal_approve`,
      arguments: [
        tx.pure.vector('u8', Array.from(idBytes)),
        tx.pure.address(account.address),
        tx.object(process.env.NEXT_PUBLIC_ACCESS_REGISTRY_ID || ''),
        tx.object('0x6'),
      ],
    });

    sharedTxBytes = await tx.build({ client, onlyTransactionKind: true });
    console.log('✅ Session initialized - will reuse for all decryptions');
  };

  const fetchAndDecryptContent = async (blobId: string): Promise<string> => {
    try {
      if (!sharedSealClient || !sharedSessionKey || !sharedTxBytes) {
        return 'Session not initialized';
      }

      // Fetch encrypted content from Walrus
      const url = `${walrusAggregator}/v1/blobs/${blobId}`;
      const response = await fetch(url);
      if (!response.ok) return 'Failed to fetch content';

      const arrayBuffer = await response.arrayBuffer();
      const encryptedData = new Uint8Array(arrayBuffer);

      // Decrypt using shared session (NO SIGNING!)
      const decryptedData = await sharedSealClient.decrypt({
        data: encryptedData,
        sessionKey: sharedSessionKey,
        txBytes: sharedTxBytes,
      });

      // Parse decrypted JSON
      const decryptedString = new TextDecoder().decode(decryptedData);
      const parsed = JSON.parse(decryptedString);
      return parsed.content || decryptedString;
    } catch (error) {
      console.error('Failed to decrypt content:', error);
      return 'Error decrypting content';
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
      // Query owned objects of type Memory
      // StructType filters REQUIRE the full package ID with 0x prefix
      const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';

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

          // Log metadata structure to debug field access
          console.log('🔍 Metadata structure:', JSON.stringify(fields.metadata, null, 2));

          // Access nested metadata fields correctly
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

      // Initialize session ONCE (user signs once)
      if (loadedMemories.length > 0) {
        console.log('🔓 Initializing decryption session (signing once)...');
        await initializeSession();

        // Decrypt all memories using the same session (NO MORE SIGNING!)
        console.log('🔓 Decrypting', loadedMemories.length, 'memories without additional signatures...');
        for (const memory of loadedMemories) {
          fetchAndDecryptContent(memory.blobId).then((content) => {
            setMemories((prev) =>
              prev.map((m) =>
                m.id === memory.id ? { ...m, content } : m
              )
            );
          });
        }
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
                      {memory.metadata.embeddingDimension} dimensions
                    </span>
                    <span>
                      Importance: {memory.metadata.importance}/10
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {memory.content && (
                  <div className="text-sm text-slate-200 bg-white/5 rounded p-3 border border-white/10">
                    {memory.content}
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
