'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SealClient } from '@mysten/seal';
import { fromHex, toHex } from '@mysten/sui/utils';
import { WalrusClient } from '@mysten/walrus';

export function CreateMemory() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [content, setContent] = useState('');
  const [category, setCategory] = useState('personal');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 10 sample categories
  const categories = [
    'personal',
    'work',
    'education',
    'health',
    'finance',
    'travel',
    'family',
    'hobbies',
    'goals',
    'ideas'
  ];

  // Normalize package ID by removing 0x prefix for move calls
  const packageId = (process.env.NEXT_PUBLIC_PACKAGE_ID || '').replace(/^0x/, '');
  const accessRegistryId = process.env.NEXT_PUBLIC_ACCESS_REGISTRY_ID || '';
  const walletRegistryId = process.env.NEXT_PUBLIC_WALLET_REGISTRY_ID || '';
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const walrusPublisher = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER || '';
  const walrusAggregator = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || '';

  console.log('📋 CreateMemory Config:', {
    packageId,
    accessRegistryId,
    walletRegistryId,
    walrusPublisher,
    hasGeminiKey: !!geminiApiKey,
  });

  const analyzeContent = async (text: string): Promise<{ category: string; importance: number }> => {
    console.log('🏷️ Analyzing content with AI...');
    setStatus('Analyzing content...');

    // Call backend API for content analysis (category + importance)
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        categories: categories
      }),
    });

    if (!response.ok) {
      console.warn('⚠️ Analysis failed, using defaults');
      return { category: 'personal', importance: 5 }; // fallback defaults
    }

    const data = await response.json();
    console.log('✅ Analysis complete:', { category: data.category, importance: data.importance });
    return { category: data.category, importance: data.importance };
  };

  const generateEmbedding = async (text: string): Promise<number[]> => {
    console.log('🔮 Step 1: Generating embeddings...');
    setStatus('Generating embeddings...');

    // Call backend API for embedding generation
    const response = await fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    console.log('📡 Embedding API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Embedding generation failed:', error);
      throw new Error(error.error || 'Failed to generate embedding');
    }

    const data = await response.json();
    console.log('✅ Embedding generated:', {
      dimensions: data.embedding?.length,
      sample: data.embedding?.slice(0, 3),
    });
    return data.embedding;
  };

  const encryptWithSEAL = async (data: Uint8Array): Promise<Uint8Array> => {
    console.log('🔒 Step 2: Encrypting with SEAL...');
    setStatus('Encrypting with SEAL...');

    if (!account?.address) {
      throw new Error('No account connected');
    }

    const address = account.address;
    console.log('👤 Owner address:', address);

    // SEAL testnet key server configuration
    const serverObjectIds = [
      '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
      '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8'
    ];

    const pdwPackageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';

    if (!pdwPackageId) {
      throw new Error('NEXT_PUBLIC_PACKAGE_ID not configured');
    }

    console.log('⚙️ SEAL Configuration:', {
      keyServers: serverObjectIds,
      pdwPackageId,
      dataSize: data.length,
    });

    // Create SEAL client
    const sealClient = new SealClient({
      suiClient: client,
      serverConfigs: serverObjectIds.map((id) => ({
        objectId: id,
        weight: 1,
      })),
      verifyKeyServers: false,
    });
    console.log('✅ SEAL client initialized');

    console.log('🔐 Encrypting with SEAL...');
    console.log('   Using owner address as ID:', address);

    // Simple: Use owner's address as the ID
    // The seal_approve function will grant access because requesting_wallet == owner
    const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
      threshold: 1,
      packageId: pdwPackageId,
      id: address, // Use owner's address as ID
      data,
    });

    console.log('✅ Encryption successful:', {
      encryptedSize: encryptedBytes.length,
      originalSize: data.length,
      first50Bytes: Array.from(encryptedBytes.slice(0, 50)),
    });

    // Verify the encrypted data is valid by checking its structure
    if (encryptedBytes.length < 100) {
      console.warn('⚠️ Encrypted data seems too small, may be corrupted');
    }

    return encryptedBytes;
t  };

  // Upload single blob to Walrus
  const uploadToWalrus = async (data: Uint8Array): Promise<string> => {
    console.log('🐳 Uploading to Walrus...');

    if (!account?.address) {
      throw new Error('No account connected');
    }

    try {
      // Create Walrus client
      const extendedClient = client.$extend(
        WalrusClient.experimental_asClientExtension({
          network: 'testnet',
          uploadRelay: {
            host: 'https://upload-relay.testnet.walrus.space',
            sendTip: { max: 1_000 },
            timeout: 60_000,
          },
          storageNodeClientOptions: {
            timeout: 60_000,
          },
        })
      );

      const walrusClient = extendedClient.walrus;
      const flow = walrusClient.writeBlobFlow({ blob: data });

      // Encode
      await flow.encode();

      // Register
      const registerTx = flow.register({
        epochs: 5,
        deletable: true,
        owner: account.address,
      });
      registerTx.setSender(account.address);

      const registerDigest = await new Promise<string>((resolve, reject) => {
        signAndExecute(
          { transaction: registerTx },
          {
            onSuccess: (result) => resolve(result.digest),
            onError: (error) => reject(error),
          }
        );
      });

      // Upload
      await flow.upload({ digest: registerDigest });

      // Certify
      const certifyTx = flow.certify();
      certifyTx.setSender(account.address);

      await new Promise<void>((resolve, reject) => {
        signAndExecute(
          { transaction: certifyTx },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          }
        );
      });

      const blob = await flow.getBlob();
      return blob.blobId;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw new Error(`Failed to upload to Walrus: ${error}`);
    }
  };

  const registerOnChain = async (contentBlobId: string, embeddingBlobId: string, importance: number) => {
    console.log('⛓️ Step 6: Registering memory on-chain...');
    setStatus('Registering memory on-chain...');

    if (!account?.address) {
      throw new Error('No account connected');
    }

    if (!packageId) {
      console.error('❌ Missing package ID');
      throw new Error('Missing configuration: Please check environment variables');
    }

    const address = String(account.address);
    console.log('👤 Registering with address:', address);

    const tx = new Transaction();

    // Create the memory record
    const topic = 'memory';
    const vectorId = Date.now(); // Use timestamp as vector ID for now

    console.log('📝 Creating memory record');
    console.log('   Target:', `${packageId}::memory::create_memory_record`);
    console.log('   Args:', {
      category,
      vectorId,
      contentBlobId,
      embeddingBlobId,
      contentSize: content.length,
    });

    tx.moveCall({
      target: `${packageId}::memory::create_memory_record`,
      arguments: [
        tx.pure.string(category), // Use the auto-categorized category
        tx.pure.u64(vectorId),
        tx.pure.string(contentBlobId),
        // Metadata parameters
        tx.pure.string('text/plain'),
        tx.pure.u64(content.length),
        tx.pure.string(''), // content_hash (empty for now)
        tx.pure.string(topic),
        tx.pure.u8(importance), // AI-scored importance (1-10 scale)
        tx.pure.string(embeddingBlobId), // embedding stored on Walrus
      ],
    });

    console.log('🔐 Signing and executing transaction...');

    return new Promise((resolve, reject) => {
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('✅ Transaction successful!', {
              digest: result.digest,
              effects: result.effects,
            });
            setStatus(`Memory created! Digest: ${result.digest}`);
            resolve(result);
          },
          onError: (error) => {
            console.error('❌ Transaction failed:', error);
            setStatus(`Error: ${error.message}`);
            reject(error);
          },
        }
      );
    });
  };

  const handleCreate = async () => {
    console.log('\n🚀 ========== Starting Memory Creation ==========');

    if (!content.trim()) {
      setStatus('Please enter some content');
      return;
    }

    if (!account) {
      setStatus('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    setStatus('Starting memory creation...');

    try {
      console.log('📝 Content length:', content.length);

      // Step 1: Analyze content (category + importance)
      const analysis = await analyzeContent(content);
      setCategory(analysis.category);
      console.log('✅ Analysis complete:', analysis);

      // Step 2: Generate embedding
      const embedding = await generateEmbedding(content);
      console.log('✅ Embedding dimensions:', embedding.length);

      // Step 3: Prepare data
      console.log('📦 Step 3: Preparing data...');
      const memoryData = JSON.stringify({
        content,
        embedding,
        timestamp: Date.now(),
      });
      const dataBytes = new TextEncoder().encode(memoryData);
      console.log('✅ Data prepared:', dataBytes.length, 'bytes');

      // Step 4: Encrypt with SEAL
      const encrypted = await encryptWithSEAL(dataBytes);

      // Step 5: Upload encrypted content to Walrus
      setStatus('Uploading content to Walrus...');
      const contentBlobId = await uploadToWalrus(encrypted);
      console.log('📦 CONTENT BLOB ID:', contentBlobId);
      console.log('🔗 Content:', `${walrusAggregator}/v1/blobs/${contentBlobId}`);

      // Step 6: Upload embedding to Walrus
      setStatus('Uploading embedding to Walrus...');
      const embeddingBytes = new Uint8Array(new Float32Array(embedding).buffer);
      const embeddingBlobId = await uploadToWalrus(embeddingBytes);
      console.log('📦 EMBEDDING BLOB ID:', embeddingBlobId);
      console.log('🔗 Embedding:', `${walrusAggregator}/v1/blobs/${embeddingBlobId}`);

      // Step 7: Register memory on-chain
      await registerOnChain(contentBlobId, embeddingBlobId, analysis.importance);

      console.log('🎉 ========== Memory Creation Complete! ==========\n');

      // Clear form
      setContent('');
    } catch (error: any) {
      console.error('❌ ========== Error creating memory ==========');
      console.error(error);
      console.error('Stack:', error.stack);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={isLoading || !content.trim()}
          className="w-full bg-primary hover:bg-primary/80 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isLoading ? 'Creating...' : 'Create Memory'}
        </button>

        {status && (
          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-sm text-slate-300 break-all">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
