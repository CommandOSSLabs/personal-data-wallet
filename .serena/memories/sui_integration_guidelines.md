# Sui Integration Guidelines

## Key Principle
Always use the Sui client to interact with the Sui network. Never attempt to interact with the network directly without going through the proper Sui client implementation.

## Implementation Details
- All Sui network interactions must go through the SuiService class
- The SuiService encapsulates the Sui client and provides methods for:
  - Getting active addresses
  - Executing transactions
  - Querying blockchain state
  - Managing wallets and keys

## Testing Approach
When testing Sui functionality:
1. Always mock the Sui client for unit tests
2. Use testnet for integration tests
3. Ensure proper error handling for network failures
4. Test transaction signing and submission flows