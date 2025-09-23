/**
 * Personal Data Wallet SDK - API Key Configuration Examples
 * 
 * This file demonstrates all the ways to configure your Gemini API key
 * for AI-powered embedding generation in the PDW SDK.
 */

import { 
  createQuickStartPipeline, 
  createPipelineManager, 
  EmbeddingService,
  Config,
  MemoryPipeline 
} from '../src/index';

// ========================================
// 🔑 METHOD 1: Direct API Key in Code
// ========================================

console.log('1️⃣ Method 1: Direct API Key Configuration');

const pipelineWithDirectKey = createQuickStartPipeline('DECENTRALIZED', {
  embedding: {
    apiKey: 'your-gemini-api-key-here',
    model: 'text-embedding-004',
    enableBatching: true,
    batchSize: 20
  }
});

// ========================================
// 🌍 METHOD 2: Environment Variables
// ========================================

console.log('2️⃣ Method 2: Environment Variable Configuration');

// Set in your shell before running:
// export GEMINI_API_KEY="your-api-key-here"
// or
// export GOOGLE_AI_API_KEY="your-api-key-here"

// Then create pipeline without API key - it will auto-detect:
const pipelineWithEnvKey = createQuickStartPipeline('BASIC');

// ========================================
// 🔧 METHOD 3: Configuration Helper
// ========================================

console.log('3️⃣ Method 3: Using Configuration Helper');

// Generate .env template
console.log('📝 .env file template:');
console.log(Config.generateEnvTemplate());

// Load configuration from environment
const envConfig = Config.fromEnv();

// Create pipeline with validated config
const pipelineWithHelper = new MemoryPipeline({
  embedding: {
    apiKey: envConfig.geminiApiKey,
    enableBatching: true
  },
  blockchain: {
    network: envConfig.suiNetwork,
    packageId: envConfig.suiPackageId
  },
  storage: {
    network: envConfig.walrusNetwork
  }
});

// ========================================
// 🏭 METHOD 4: Pipeline Manager with Config
// ========================================

console.log('4️⃣ Method 4: Pipeline Manager Configuration');

const manager = createPipelineManager({
  defaultPipelineConfig: {
    embedding: {
      apiKey: Config.getGeminiKey(), // Throws helpful error if not found
      enableBatching: true,
      batchSize: 20
    }
  }
});

// Create multiple pipelines with the default config
const basicPipelineId = manager.createPipelineFromTemplate('Basic Memory Processing', 'my-basic');
const advancedPipelineId = manager.createPipelineFromTemplate('Full Decentralized Pipeline', 'my-advanced');

// ========================================
// 🛠️ METHOD 5: Direct EmbeddingService
// ========================================

console.log('5️⃣ Method 5: Direct EmbeddingService Configuration');

// Option A: With explicit API key
const embeddingServiceA = new EmbeddingService({
  apiKey: 'your-gemini-api-key-here',
  model: 'text-embedding-004',
  requestsPerMinute: 1500
});

// Option B: Auto-detect from environment
const embeddingServiceB = new EmbeddingService(); // Will use GEMINI_API_KEY or GOOGLE_AI_API_KEY

// ========================================
// 📋 CONFIGURATION VALIDATION & DEBUGGING
// ========================================

console.log('📋 Configuration Validation & Debugging');

// Validate your configuration
const validation = Config.validate({
  geminiApiKey: process.env.GEMINI_API_KEY,
  suiNetwork: 'testnet',
  suiPackageId: process.env.SUI_PACKAGE_ID
});

if (!validation.isValid) {
  console.error('❌ Configuration errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('⚠️ Configuration warnings:', validation.warnings);
}

// Print current configuration (with masked keys for security)
try {
  const currentConfig = Config.create();
  console.log('✅ Current configuration loaded successfully');
  // Note: Don't print in production - contains sensitive data
} catch (error) {
  console.error('❌ Configuration error:', error.message);
}

// ========================================
// 🚀 USAGE EXAMPLES
// ========================================

async function demonstrateUsage() {
  console.log('🚀 Usage Examples');

  try {
    // Example memory to process
    const exampleMemory = {
      id: 'memory_1',
      content: 'This is my important memory about learning the PDW SDK',
      category: 'learning',
      createdAt: new Date()
    };

    // Process memory with auto-configured pipeline
    const pipeline = createQuickStartPipeline('BASIC');
    const execution = await pipeline.processMemory(exampleMemory, 'user_123');
    
    console.log('✅ Memory processed successfully!');
    console.log('Processing steps completed:', execution.steps.filter(s => s.status === 'completed').length);
    
  } catch (error) {
    if (error.message.includes('API key')) {
      console.error('🔑 API Key Error - Please configure your Gemini API key:');
      console.log(Config.generateEnvTemplate());
    } else {
      console.error('❌ Processing error:', error.message);
    }
  }
}

// ========================================
// 📖 SETUP INSTRUCTIONS
// ========================================

console.log(`
📖 SETUP INSTRUCTIONS

1. 🔑 Get your Gemini API key:
   - Visit: https://makersuite.google.com/app/apikey
   - Create a new API key (free tier available)
   - Copy the key

2. 🌍 Set environment variable (recommended):
   
   # Linux/macOS:
   export GEMINI_API_KEY="your-api-key-here"
   
   # Windows PowerShell:
   $env:GEMINI_API_KEY="your-api-key-here"
   
   # Or add to .env file:
   echo "GEMINI_API_KEY=your-api-key-here" >> .env

3. 🚀 Use the SDK:
   
   import { createQuickStartPipeline } from '@pdw/sdk';
   
   const pipeline = createQuickStartPipeline('BASIC');
   // API key will be auto-detected from environment!

4. 🔒 Security best practices:
   - Never commit API keys to git
   - Use environment variables in production
   - Rotate keys regularly
   - Monitor usage in Google AI Studio
`);

export {
  pipelineWithDirectKey,
  pipelineWithEnvKey,
  pipelineWithHelper,
  manager,
  embeddingServiceA,
  embeddingServiceB,
  demonstrateUsage
};