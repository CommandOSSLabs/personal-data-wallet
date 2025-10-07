'use client';

import { useState } from 'react';
import { useCurrentAccount, useSuiClient, useSignPersonalMessage } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SealClient, SessionKey } from '@mysten/seal';
import { fromHex, toHex } from '@mysten/sui/utils';

export function RetrieveMemory() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const [blobId, setBlobId] = useState('');
  const [decryptedContent, setDecryptedContent] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const walrusAggregator = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || '';
  // Use YOUR PDW package ID
  const pdwPackageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';

  const fetchAndDecryptContent = async (blobId: string): Promise<string> => {
    try {
      if (!account?.address) {
        throw new Error('No wallet connected');
      }

      console.log('🐳 Step 1: Retrieving from Walrus...');
      console.log('📥 Blob ID:', blobId);
      setStatus('Retrieving from Walrus...');

      // Fetch encrypted content from Walrus
      const url = `${walrusAggregator}/v1/blobs/${blobId}`;
      console.log('🌐 Fetching:', url);

      const response = await fetch(url);
      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Walrus retrieval failed:', errorText);
        throw new Error('Failed to fetch content');
      }

      const arrayBuffer = await response.arrayBuffer();
      const encryptedData = new Uint8Array(arrayBuffer);
      console.log('✅ Retrieved', encryptedData.length, 'bytes from Walrus');
      console.log('📊 Retrieved first 50 bytes:', Array.from(encryptedData.slice(0, 50)));
      console.log('📊 Retrieved last 20 bytes:', Array.from(encryptedData.slice(-20)));

      console.log('🔓 Step 2: Decrypting with SEAL...');
      setStatus('Creating session key...');

      // Decrypt with SEAL
      const serverObjectIds = [
        '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
        '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8'
      ];

      const sealClient = new SealClient({
        suiClient: client,
        serverConfigs: serverObjectIds.map((id) => ({ objectId: id, weight: 1 })),
        verifyKeyServers: false,
      });
      console.log('✅ SEAL client initialized');

      // Create session key
      console.log('🔑 Creating session key...');
      const sessionKey = await SessionKey.create({
        address: account.address,
        packageId: pdwPackageId,
        ttlMin: 10,
        suiClient: client,
      });
      console.log('✅ Session key created');

      // Sign personal message
      console.log('✍️ Signing personal message...');
      const personalMessage = sessionKey.getPersonalMessage();
      setStatus('Signing personal message...');

      const signatureResult = await signPersonalMessage({ message: personalMessage });
      await sessionKey.setPersonalMessageSignature(signatureResult.signature);
      console.log('✅ Message signed');

      // Build seal_approve transaction
      console.log('🔐 Building seal_approve transaction...');
      setStatus('Building access control transaction...');

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

      const txBytes = await tx.build({ client, onlyTransactionKind: true });
      console.log('✅ Transaction built');

      // Decrypt
      console.log('🔓 Decrypting data...');
      setStatus('Decrypting with SEAL...');

      const decryptedData = await sealClient.decrypt({
        data: encryptedData,
        sessionKey,
        txBytes,
      });
      console.log('✅ Decryption successful:', decryptedData.length, 'bytes');

      // Parse decrypted JSON
      const decryptedString = new TextDecoder().decode(decryptedData);
      const parsed = JSON.parse(decryptedString);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      console.error('Failed to decrypt content:', error);
      throw error;
    }
  };

  const handleRetrieve = async () => {
    console.log('\n🔍 ========== Starting Memory Retrieval ==========');

    if (!blobId.trim()) {
      setStatus('Please enter a blob ID');
      return;
    }

    if (!account) {
      setStatus('Please connect your wallet');
      return;
    }

    console.log('📥 Blob ID to retrieve:', blobId);

    setIsLoading(true);
    setStatus('Starting retrieval...');
    setDecryptedContent('');

    try {
      const decryptedJson = await fetchAndDecryptContent(blobId);
      setDecryptedContent(decryptedJson);
      setStatus('Successfully decrypted!');
      console.log('🎉 ========== Retrieval Complete ==========\n');
    } catch (error: any) {
      console.error('❌ ========== Error retrieving memory ==========');
      console.error(error);
      console.error('Stack:', error.stack);
      setStatus(`Error: ${error.message}`);
      setDecryptedContent('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">Retrieve & Decrypt Memory</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Walrus Blob ID
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            placeholder="Enter blob ID from Walrus..."
            value={blobId}
            onChange={(e) => setBlobId(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button
          onClick={handleRetrieve}
          disabled={isLoading || !blobId.trim()}
          className="w-full bg-secondary hover:bg-secondary/80 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isLoading ? 'Retrieving...' : 'Retrieve & Decrypt'}
        </button>

        {status && (
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-sm text-slate-300 break-all">{status}</p>
          </div>
        )}

        {decryptedContent && (
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-2">Decrypted Content:</h3>
            <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
              {decryptedContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
