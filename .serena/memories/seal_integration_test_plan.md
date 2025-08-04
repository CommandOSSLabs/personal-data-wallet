# SEAL Integration Test Plan

## Goal
Test the real Mysten SEAL implementation with actual network calls to Sui testnet and real SEAL key servers.

## Test Requirements
1. Real Sui testnet connection
2. Valid test wallet with SUI balance
3. Real SEAL key servers on testnet
4. Actual encryption/decryption operations
5. Real session key management with wallet signatures

## Test Scenarios
1. **Real Encryption**: Encrypt data using actual SEAL IBE with testnet key servers
2. **Real Decryption**: Decrypt using real wallet signatures and session keys
3. **Network Latency**: Measure actual encryption/decryption times
4. **Threshold Security**: Verify 2-of-N key server threshold in practice
5. **Session Management**: Test real session key lifecycle
6. **Error Scenarios**: Test with invalid addresses, signatures, etc.

## Key Differences from Unit Tests
- No mocks - real SEAL client
- Real network calls to Sui testnet
- Actual cryptographic operations
- Real key server interactions
- Measurable performance metrics