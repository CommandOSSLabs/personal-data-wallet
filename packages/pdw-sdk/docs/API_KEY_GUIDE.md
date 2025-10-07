# 🔑 API Key Configuration Guide

The Personal Data Wallet SDK uses the **Google Gemini API** for AI-powered embedding generation. This guide shows you exactly where and how to configure your API key.

## 🚀 Quick Start (Recommended)

### 1. Get Your API Key
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key (free tier available)
- Copy the API key

### 2. Set Environment Variable
```bash
# Linux/macOS
export GEMINI_API_KEY="your-api-key-here"

# Windows PowerShell  
$env:GEMINI_API_KEY="your-api-key-here"

# Or create .env file
echo "GEMINI_API_KEY=your-api-key-here" > .env
```

### 3. Use the SDK
```typescript
import { createQuickStartPipeline } from '@pdw/sdk';

// API key auto-detected from environment!
const pipeline = createQuickStartPipeline('BASIC');

await pipeline.processMemory({
  id: 'memory_1', 
  content: 'My important memory',
  category: 'personal',
  createdAt: new Date()
}, 'user_address');
```

## 📍 All Configuration Methods

### Method 1: Pipeline Configuration (Direct)
```typescript
import { createQuickStartPipeline } from '@pdw/sdk';

const pipeline = createQuickStartPipeline('DECENTRALIZED', {
  embedding: {
    apiKey: 'your-gemini-api-key-here', // ← API key here
    model: 'text-embedding-004',
    enableBatching: true
  }
});
```

### Method 2: Environment Variables (Recommended)
```typescript
// Set GEMINI_API_KEY or GOOGLE_AI_API_KEY environment variable
const pipeline = createQuickStartPipeline('BASIC'); // Auto-detects API key
```

### Method 3: Configuration Helper
```typescript
import { Config, MemoryPipeline } from '@pdw/sdk';

const config = Config.create({
  geminiApiKey: 'your-api-key-here' // ← API key here
});

const pipeline = new MemoryPipeline({
  embedding: { 
    apiKey: config.geminiApiKey 
  }
});
```

### Method 4: Direct EmbeddingService
```typescript
import { EmbeddingService } from '@pdw/sdk';

const embeddingService = new EmbeddingService({
  apiKey: 'your-gemini-api-key-here' // ← API key here
});
```

### Method 5: Pipeline Manager
```typescript
import { createPipelineManager } from '@pdw/sdk';

const manager = createPipelineManager({
  defaultPipelineConfig: {
    embedding: {
      apiKey: 'your-gemini-api-key-here' // ← API key here
    }
  }
});
```

## 🔧 Configuration Locations Summary

| Location | File Path | How to Set |
|----------|-----------|------------|
| **EmbeddingService Constructor** | `src/embedding/EmbeddingService.ts:52` | `new EmbeddingService({ apiKey: "..." })` |
| **Pipeline Config** | Any pipeline creation | `{ embedding: { apiKey: "..." } }` |
| **Environment Variables** | System environment | `export GEMINI_API_KEY="..."` |
| **Configuration Helper** | `src/config/ConfigurationHelper.ts` | `Config.create({ geminiApiKey: "..." })` |

## 📋 Environment Variables

The SDK checks for API keys in this order:

1. `config.apiKey` parameter (highest priority)
2. `GEMINI_API_KEY` environment variable  
3. `GOOGLE_AI_API_KEY` environment variable (fallback)

## 🛡️ Security Best Practices

✅ **DO:**
- Use environment variables in production
- Add `.env` to your `.gitignore`
- Rotate API keys regularly
- Monitor usage in Google AI Studio

❌ **DON'T:**
- Commit API keys to git repositories
- Hardcode keys in source code for production
- Share API keys in public channels
- Use the same key across multiple environments

## 🔍 Troubleshooting

### Error: "Gemini API key is required"
```typescript
// The SDK will show this helpful error:
throw new Error(
  'Gemini API key is required for embedding generation. ' +
  'Provide it via:\n' +
  '1. config.apiKey parameter\n' +
  '2. GEMINI_API_KEY environment variable\n' +
  '3. GOOGLE_AI_API_KEY environment variable\n' +
  'Get your API key from: https://makersuite.google.com/app/apikey'
);
```

### Validate Your Configuration
```typescript
import { Config } from '@pdw/sdk';

const validation = Config.validate({
  geminiApiKey: process.env.GEMINI_API_KEY
});

if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

### Generate .env Template
```typescript
import { Config } from '@pdw/sdk';

console.log(Config.generateEnvTemplate());
// Outputs a complete .env file template
```

## 📚 Example Files

- **Complete Examples**: `examples/api-key-configuration.ts`
- **Configuration Helper**: `src/config/ConfigurationHelper.ts`
- **Embedding Service**: `src/embedding/EmbeddingService.ts`

## 🆘 Need Help?

1. **Check the examples**: `examples/api-key-configuration.ts`
2. **Validate your config**: Use `Config.validate()`
3. **Check environment**: `echo $GEMINI_API_KEY`
4. **Generate template**: `Config.generateEnvTemplate()`

The SDK is designed to give you helpful error messages and multiple ways to configure your API key securely!