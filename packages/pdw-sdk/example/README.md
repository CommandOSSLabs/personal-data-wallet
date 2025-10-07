# Personal Data Wallet Demo

A comprehensive demo application showcasing the complete Personal Data Wallet (PDW) SDK workflow, including memory creation, AI embeddings, SEAL encryption, Walrus storage, and decryption.

## Features

This demo application demonstrates:

- 🔐 **Wallet-Based Access Control** - Hierarchical wallet system for secure data access
- 🧠 **AI Embeddings** - Generate embeddings using Google Gemini API
- 🔒 **SEAL Encryption** - Mysten Labs' encryption for blockchain data
- 💾 **Walrus Storage** - Decentralized storage for encrypted data
- 📝 **Memory Management** - Create, list, and retrieve encrypted memories
- 🔓 **Decryption Flow** - Complete retrieve and decrypt workflow

## Architecture

```
┌─────────────────┐
│   Next.js App   │
└────────┬────────┘
         │
         ├─── Create Memory Flow
         │    1. User enters content
         │    2. Generate AI embeddings (Gemini)
         │    3. Encrypt with SEAL
         │    4. Upload to Walrus
         │    5. Register on Sui blockchain
         │
         ├─── List Memories Flow
         │    1. Query owned Memory objects
         │    2. Display with metadata
         │
         └─── Retrieve & Decrypt Flow
              1. Fetch from Walrus by blob ID
              2. Decrypt with SEAL
              3. Display original content
```

## Prerequisites

- **Node.js** v20 or higher
- **npm** or **pnpm**
- **Sui Wallet** (Chrome extension)
- **Google Gemini API Key** (for embeddings)
- **Sui Testnet Tokens** (get from [faucet](https://discord.gg/sui))

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```bash
# Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet

# Smart Contract IDs (already configured for testnet)
NEXT_PUBLIC_PACKAGE_ID=0x8973c38babdf022a4f6a57d3718737600400d84cd3a0d19de45425de61abd2a1
NEXT_PUBLIC_ACCESS_REGISTRY_ID=0x4674f831228c357f658adbbfc3f49926252aa11f0fa498abd87b975edf1eba1c
NEXT_PUBLIC_WALLET_REGISTRY_ID=0x476eaf8676d8dc7dac54cfa9f23694d4fe55205d510341c9f983de008f5a36f2

# Google Gemini API Key (REQUIRED)
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here

# Walrus Configuration (already configured for testnet)
NEXT_PUBLIC_WALRUS_PUBLISHER=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space
```

### 3. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into your `.env.local` file

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Connect Wallet

1. Click "Connect Wallet" button
2. Select your Sui wallet (e.g., Sui Wallet)
3. Approve the connection

### Create a Memory

1. Enter your memory content in the text area
2. Click "Create Memory"
3. The app will:
   - Generate AI embeddings for semantic search
   - Encrypt the data using SEAL
   - Upload encrypted data to Walrus
   - Register the memory on Sui blockchain
4. Approve the transaction in your wallet
5. Wait for confirmation (usually 2-5 seconds)

### View Your Memories

- Your memories appear automatically in the right panel
- Click "Refresh" to reload the list
- Each memory shows:
  - Title (first 100 characters)
  - Content preview
  - Creation timestamp
  - Embedding dimensions
  - Object ID

### Retrieve & Decrypt

1. Get the Walrus blob ID from the create memory status
2. Paste it into the "Retrieve & Decrypt Memory" section
3. Click "Retrieve & Decrypt"
4. The app will:
   - Fetch encrypted data from Walrus
   - Decrypt using SEAL
   - Display the original content

## Code Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page component
│   ├── providers.tsx       # Sui wallet and query providers
│   └── globals.css         # Global styles
│
└── components/
    ├── CreateMemory.tsx    # Memory creation with encryption
    ├── MemoryList.tsx      # List of on-chain memories
    └── RetrieveMemory.tsx  # Decryption and retrieval
```

## Key Components

### CreateMemory Component

Demonstrates the complete creation flow:

```typescript
// 1. Generate embedding
const embedding = await generateEmbedding(content);

// 2. Encrypt with SEAL
const encrypted = await encryptWithSEAL(dataBytes);

// 3. Upload to Walrus
const blobId = await uploadToWalrus(encrypted);

// 4. Register on-chain
await registerOnChain(blobId, embedding);
```

### RetrieveMemory Component

Demonstrates the decryption flow:

```typescript
// 1. Retrieve from Walrus
const encrypted = await retrieveFromWalrus(blobId);

// 2. Decrypt with SEAL
const decrypted = await decryptWithSEAL(encrypted);

// 3. Parse and display
const data = JSON.parse(new TextDecoder().decode(decrypted));
```

## Smart Contract Interactions

### Register Context Wallet

```typescript
tx.moveCall({
  target: `${packageId}::seal_access_control::register_context_wallet`,
  arguments: [
    tx.object(accessRegistryId),
    tx.pure.address(walletAddress),
    tx.pure.u64(0),
    tx.pure.string('pdw-demo'),
    tx.object('0x6'),
  ],
});
```

### Create Memory

```typescript
tx.moveCall({
  target: `${packageId}::memory::create_memory`,
  arguments: [
    tx.object(walletRegistryId),
    tx.pure.string(title),
    tx.pure.string(content),
    tx.pure.vector('u8', metadata),
    tx.pure.vector('f32', embedding),
    tx.pure.string('pdw-demo'),
  ],
});
```

## Troubleshooting

### "Gemini API key not configured"
- Make sure you've set `NEXT_PUBLIC_GEMINI_API_KEY` in `.env.local`
- Restart the dev server after adding the key

### "Insufficient gas"
- Get testnet SUI tokens from [Discord faucet](https://discord.gg/sui)
- Use the `#devnet-faucet` channel

### "Failed to upload to Walrus"
- Check your internet connection
- Walrus testnet might be temporarily down
- Try again in a few moments

### Wallet connection issues
- Make sure Sui Wallet extension is installed
- Switch to Sui Testnet in your wallet
- Try disconnecting and reconnecting

## Resources

- [PDW SDK Documentation](https://www.npmjs.com/package/personal-data-wallet-sdk)
- [Sui Documentation](https://docs.sui.io/)
- [Walrus Documentation](https://docs.walrus.site/)
- [SEAL Documentation](https://github.com/MystenLabs/seal)
- [Google Gemini API](https://ai.google.dev/)

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [CommandOSS/personal_data_wallet](https://github.com/CommandOSS/personal_data_wallet/issues)
- SDK Package: [personal-data-wallet-sdk](https://www.npmjs.com/package/personal-data-wallet-sdk)
