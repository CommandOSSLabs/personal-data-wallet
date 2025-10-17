# Personal Data Wallet - Example App

A Next.js demo application showcasing the Personal Data Wallet SDK for decentralized memory management with AI embeddings, SEAL encryption, and Walrus storage.

## Features

- 🧠 **Create Memories** - Store data with AI-powered categorization
- 🔍 **Vector Search** - Find memories using semantic search
- 💬 **Memory Chat (RAG)** - AI assistant with context from your memories
- 🕸️ **Knowledge Graph** - Visualize relationships between memories
- 🔐 **Access Control** - Grant and revoke memory access
- 📁 **Context Wallets** - Organize memories into contexts

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 8.x or higher
- **Sui Wallet** (browser extension for testnet)
  - [Sui Wallet Chrome Extension](https://chrome.google.com/webstore/detail/sui-wallet)
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Installation

### 1. Clone and Navigate

```bash
cd packages/pdw-sdk/example
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including the local SDK from `file:../`.

### 3. Environment Setup

Create a `.env.local` file in the example directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
# Sui Blockchain Configuration
NEXT_PUBLIC_PACKAGE_ID=0x067706fc08339b715dab0383bd853b04d06ef6dff3a642c5e7056222da038bde
NEXT_PUBLIC_ACCESS_REGISTRY_ID=0x1d0a1936e170e54ff12ef30a042b390a8ef6dae0febcdd62c970a87eebed8659

# Walrus Storage Configuration
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space

# AI Configuration (Required)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

#### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the key and paste it into `.env.local`

> ⚠️ **Important:** The app will not work without a valid Gemini API key. This is required for AI-powered features like memory categorization and embeddings.

## Running the App

### Development Mode

```bash
npm run dev
```

The app will start on [http://localhost:3000](http://localhost:3000) (or 3001 if 3000 is in use).

### Production Build

```bash
npm run build
npm run start
```

## Using the App

### 1. Connect Your Wallet

1. Open the app in your browser
2. Click **"Connect Wallet"** in the top-right
3. Select your Sui wallet and approve the connection
4. Make sure you're on **Sui Testnet**

### 2. Get Testnet SUI Tokens

You need testnet SUI tokens to pay for transactions:

```bash
# Request testnet tokens
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "FixedAmountRequest": {
      "recipient": "YOUR_WALLET_ADDRESS"
    }
  }'
```

Or use the [Sui Testnet Faucet](https://faucet.sui.io/) web interface.

### 3. Create Your First Memory

1. Navigate to the **"Create"** tab
2. Enter some text (e.g., "I love TypeScript and building decentralized apps")
3. Click **"Create Memory"**
4. Approve the transaction in your wallet
5. Wait for the memory to be processed (~5-10 seconds)

### 4. Search Your Memories

1. Navigate to the **"Vector Search"** tab
2. Enter a search query (e.g., "programming languages")
3. Adjust similarity threshold and result count as needed
4. View semantically similar memories

### 5. Chat with Your Memories

1. Navigate to the **"AI Chat"** tab
2. Ask questions about your memories
3. The AI will retrieve relevant context and respond
4. Save important messages as new memories

## Architecture

```
example/
├── src/
│   ├── app/
│   │   ├── api/              # API routes for AI operations
│   │   │   ├── analyze/      # Content analysis endpoint
│   │   │   ├── categorize/   # Category detection endpoint
│   │   │   └── embed/        # Embedding generation endpoint
│   │   ├── layout.tsx        # Root layout with providers
│   │   ├── page.tsx          # Main page with tabs
│   │   └── providers.tsx     # React Query + Sui providers
│   ├── components/           # React components
│   │   ├── CreateMemory.tsx  # Memory creation (uses SDK hooks)
│   │   ├── SearchMemory.tsx  # Vector search
│   │   ├── MemoryChat.tsx    # RAG chat interface
│   │   ├── KnowledgeGraph.tsx# Graph visualization
│   │   └── ...               # Other components
│   └── styles/
├── public/
├── .env.local               # Your environment variables (not committed)
├── .env.example             # Example environment file
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies
└── README.md                # This file
```

## Key SDK Integration

The example app uses the Personal Data Wallet SDK in two ways:

### 1. React Hooks (Recommended)

```typescript
import { useCreateMemory } from 'personal-data-wallet-sdk';

const { mutate: createMemory, isPending, progress } = useCreateMemory({
  config: {
    packageId: process.env.NEXT_PUBLIC_PACKAGE_ID!,
    geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
  },
  onSuccess: (result) => console.log('Created:', result.blobId),
});

// Use it
createMemory({ content: 'My memory', category: 'general' });
```

### 2. Direct Manager (Alternative)

```typescript
import { ClientMemoryManager } from 'personal-data-wallet-sdk';

const manager = new ClientMemoryManager({
  packageId: process.env.NEXT_PUBLIC_PACKAGE_ID!,
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
});

const blobId = await manager.createMemory({
  content: 'My memory',
  account,
  signAndExecute,
  client,
});
```

## Troubleshooting

### Build Fails / Module Resolution Errors

If you see errors during build:

```bash
# Clean everything and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### "Gemini API key not configured"

Ensure your `.env.local` has the API key:

```env
NEXT_PUBLIC_GEMINI_API_KEY=AIza...your_key_here
```

Restart the dev server after changing `.env.local`.

### Wallet Not Connecting

1. Install the [Sui Wallet extension](https://chrome.google.com/webstore/detail/sui-wallet)
2. Switch to **Testnet** in wallet settings
3. Refresh the page and try again

### Memory Creation Stuck

If memory creation hangs:

1. Check browser console for errors
2. Verify your wallet has testnet SUI tokens
3. Check that Gemini API key is valid
4. Ensure Walrus aggregator is accessible

### Port Already in Use

If port 3000 is in use:

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or let Next.js use an alternative port (it will try 3001 automatically)
npm run dev
```

### SDK Changes Not Reflecting

When making changes to the SDK:

```bash
# 1. Build the SDK
cd packages/pdw-sdk
npm run build

# 2. Reinstall in example app
cd example
rm -rf node_modules/personal-data-wallet-sdk
npm install

# 3. Restart dev server
npm run dev
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_PACKAGE_ID` | Yes | Sui smart contract package ID (testnet) |
| `NEXT_PUBLIC_ACCESS_REGISTRY_ID` | Yes | Access control registry object ID |
| `NEXT_PUBLIC_WALRUS_AGGREGATOR` | Yes | Walrus storage aggregator URL |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |

## Performance Notes

- **Memory Creation**: ~5-10 seconds (includes AI analysis + encryption + storage)
- **Vector Search**: ~50-200ms (after index is loaded)
- **Memory Retrieval**: ~300-500ms (includes decryption)

## SDK Development Workflow

This example app uses the local SDK via `file:../`. When developing:

```bash
# 1. Make changes in packages/pdw-sdk/src/
# 2. Build the SDK
cd packages/pdw-sdk
npm run build

# 3. The example app automatically uses the latest build
cd example
npm run dev
```

## Learn More

- [Personal Data Wallet SDK Documentation](../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Sui Documentation](https://docs.sui.io)
- [Walrus Documentation](https://docs.walrus.site)
- [@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit)

## Support

If you encounter issues:

1. Check this README's troubleshooting section
2. Review the [SDK documentation](../README.md)
3. Open an issue on [GitHub](https://github.com/CommandOSSLabs/personal-data-wallet/issues)

## License

MIT
