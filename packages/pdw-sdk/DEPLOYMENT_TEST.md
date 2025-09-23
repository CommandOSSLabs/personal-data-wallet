# SEAL Deployment Testing Guide

## Overview

This guide helps you test the SEAL functionality with your deployed Sui Move contract:
**Package ID:** `0x067706fc08339b715dab0383bd853b04d06ef6dff3a642c5e7056222da038bde`

## Quick Start

### 1. Environment Setup

```bash
# Copy the test environment file
cp .env.test .env

# Edit .env with your actual API keys
# The package ID is already configured!
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run SEAL Tests

```bash
# Quick connectivity test
npm run test:seal

# Full deployment test with build
npm run test:deploy

# Watch mode for development
npm run test:seal:watch
```

## Configuration

### Required Environment Variables

```env
# Your deployed contract (already configured)
SUI_PACKAGE_ID=0x067706fc08339b715dab0383bd853b04d06ef6dff3a642c5e7056222da038bde

# SEAL Configuration (Mysten Labs testnet)
SEAL_KEY_SERVER_URL=https://testnet.seal.mysten.app
SEAL_NETWORK=testnet

# API Keys (required for full testing)
GOOGLE_API_KEY=your-google-api-key-here
SUI_ADMIN_PRIVATE_KEY=your-sui-private-key-here
```

## Test Scenarios

### 1. Connectivity Test (`seal-connectivity.test.ts`)
- ✅ Validates deployed contract configuration
- ✅ Verifies SEAL key server connectivity  
- ✅ Tests configuration helper functionality
- ⏱️ **Runtime:** ~5 seconds

### 2. Full Integration Test (`seal-deployment.test.ts`)
- 🔐 Tests SEAL decryption pipeline with official Mysten Labs servers
- 📊 Validates memory retrieval with auto-decryption
- 🌐 Tests integration with your deployed Sui contract
- 📈 Performance monitoring and analytics
- ⏱️ **Runtime:** ~30-60 seconds

## Expected Outputs

### Successful Test Run
```
✅ SEAL Connectivity Test
  ✅ should validate deployed contract configuration
  ✅ should validate SEAL key server configuration
  ✅ should generate SEAL configuration from helper
  ✅ should validate environment template generation

🚀 SEAL Deployment Integration Tests
  ✅ Configuration Validation
  ✅ SEAL Decryption Pipeline
  ✅ Integration with Deployed Contract
  ✅ Performance and Analytics
  ✅ Error Handling and Resilience
```

### Key Metrics Tracked
- 🔐 **Decryption Success Rate**
- ⚡ **SEAL Key Server Latency**
- 📊 **Session Management Performance**
- 🌐 **Sui Contract Interaction Success**

## Troubleshooting

### Common Issues

1. **Missing API Keys**
   ```bash
   Error: Missing GOOGLE_API_KEY
   Solution: Add your Google AI API key to .env file
   ```

2. **SEAL Key Server Timeout**
   ```bash
   Error: SEAL request timeout
   Solution: Check network connectivity or increase SEAL_TIMEOUT_MS
   ```

3. **Sui Contract Connection**
   ```bash
   Error: Package not found
   Solution: Verify your contract is deployed and package ID is correct
   ```

### Debug Mode

```bash
# Run tests with verbose output
VERBOSE_TESTS=true npm run test:seal

# Run specific test file
npx jest seal-connectivity --verbose
```

## Integration Verification

After successful testing, you'll have verified:

- ✅ **SEAL Integration:** Official Mysten Labs testnet key servers
- ✅ **Contract Deployment:** Your Sui Move contract is accessible  
- ✅ **Memory Pipeline:** End-to-end encrypted memory retrieval
- ✅ **Performance:** Sub-second decryption with proper caching
- ✅ **Error Handling:** Graceful fallbacks and retry mechanisms

## Next Steps

1. **Production Deployment:** Update to mainnet configuration
2. **Backend Integration:** Connect with your backend services
3. **Frontend Integration:** Implement UI for memory management
4. **Performance Optimization:** Fine-tune batch sizes and caching

## Support

For issues with:
- **SEAL Integration:** Check Mysten Labs SEAL documentation
- **Contract Issues:** Verify Move contract deployment
- **SDK Issues:** Review the test logs and error messages

---

**🎉 Ready to test your SEAL deployment!**