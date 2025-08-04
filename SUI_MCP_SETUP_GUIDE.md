# Sui MCP Setup Guide for Claude Code

## Configuration Complete

Sui MCP has been configured for your Personal Data Wallet project. Here's how to use it:

## 1. Restart Claude Code

After configuration, you need to restart Claude Code for the MCP servers to initialize.

## 2. Available Sui MCP Tools

Once active, you'll have access to these tools:

### Wallet Management
- `sui_getActiveAddress` - Get current active wallet address
- `sui_getBalance` - Check wallet balance
- `sui_switchAccount` - Switch between wallet accounts

### Transaction Tools
- `sui_signAndExecuteTransactionBlock` - Sign and execute transactions
- `sui_dryRunTransactionBlock` - Test transactions without executing
- `sui_getTransactionBlock` - Get transaction details

### Object & Module Tools
- `sui_getObject` - Retrieve object data from chain
- `sui_getOwnedObjects` - List objects owned by address
- `sui_getNormalizedMoveModule` - Get Move module details

### Network Information
- `sui_getChainIdentifier` - Get current network info
- `sui_getCheckpoint` - Get checkpoint data
- `sui_getTotalTransactionBlocks` - Get total transaction count

## 3. Testing SEAL Integration with Real Signatures

Now you can test SEAL with real wallet signatures:

```typescript
// Example: Get wallet address
const address = await sui_getActiveAddress();

// Example: Sign message for SEAL session key
const message = await sealService.getSessionKeyMessage(address);
const signature = await sui_signPersonalMessage({ message });

// Example: Create transaction for seal_approve
const tx = new Transaction();
tx.moveCall({
  target: `${SEAL_PACKAGE_ID}::access_control::seal_approve`,
  arguments: [tx.pure.vector("u8", fromHEX(id))]
});
const result = await sui_signAndExecuteTransactionBlock({ 
  transactionBlock: tx 
});
```

## 4. Run Integration Test

Execute the test with real blockchain interactions:

```bash
cd backend
npx ts-node src/test/run-seal-test.ts
```

## 5. Configuration Files

- **Project MCP Config**: `.mcp/config.json`
- **Claude Code Config**: `claude-code.json`
- **Test Scripts**: `src/test/`

## Troubleshooting

1. **MCP not recognized**: Restart Claude Code
2. **Wallet not connected**: Run `npx @jordangens/sui-mcp@latest init` again
3. **Network issues**: Check you're on testnet in wallet settings

## Next Steps

1. Test memory encryption with real signatures
2. Verify threshold decryption works
3. Measure performance with actual key servers
4. Deploy SEAL contracts if needed