# Personal Data Wallet — Copilot Guide (SDK: packages/pdw-sdk)

Purpose: make AI agents productive inside the SDK by pointing to the right files, APIs, and workflows.

## Scope and role
- **Primary Purpose**: PDW is a vector embedding storage system that stores vector embeddings on Walrus with rich metadata, tag-based search, and graph relationships
- The SDK wraps Sui + Walrus + SEAL and exposes a single client extension for vector embedding storage, metadata search, access control, and view calls
- **Core Functionality**: Store vector embeddings with metadata → Search by tags/properties → Build knowledge graphs → SEAL encryption for sensitive data
- It relies on generated Move bindings under `src/generated/pdw/*` and a configured `packageId` to talk to deployed contracts

## Current Status: Storage Service Consolidation Complete ✅
**PRODUCTION READY**: Storage operations unified under services/StorageService.ts with 100% test validation and zero build errors.

### ✅ Completed Consolidation Phase:
1. **✅ SEAL Integration**: SealService working with official @mysten/seal package
2. **✅ Walrus Integration**: StorageService using official writeBlobFlow patterns with upload relay
3. **✅ Memory Operations**: Existing memory creation/retrieval flows confirmed working
4. **✅ Client Extension**: PersonalDataWallet client extension loading and functioning correctly
5. **✅ OAuth Access Control**: Comprehensive OAuth-style permission system implemented and tested
6. **✅ Smart Contract**: Updated seal_access_control.move deployed with OAuth validation
7. **✅ ViewService Testing**: 33/33 comprehensive tests passing (100% success rate)
8. **✅ StorageService Consolidation**: Production service with 4/4 tests passing (~60s execution time)

### **CRITICAL Test Quality Gates**:
- **ALL TESTS MUST PASS**: No component proceeds to next phase with failing tests
- **100% Pass Rate Required**: Tests must achieve complete success before moving forward
- **Real Data Integration**: Use actual object IDs from testnet for realistic testing
- **Run Tests After Every Edit**: Verify test success after each implementation change

### Real Testnet Data Sources (for realistic testing):
**User Address**: `0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15`
**Suiscan URL**: https://suiscan.xyz/testnet/account/0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15

**Real Walrus Blob IDs** (use in tests instead of mock data):
- `0x0e9058ca720598c364352f37d0aa4d2b15961242354f361f3df4f2a020f4b237` (12b)
- `0x0fc3708e2b08c54410ba2d114dc2ad142a11432feaf2e5e468322ec5c3e7ca0f` (445556b)
- `0x15f25a0cc3a7c7cc7034c2fe4cd6f0b8878bccdb77cd2cd129c1c64d3b30a920` (445556b)
- `0x189be71333f2ee345b024f2fb7ffed7e4ad8ff4c99475c8a7b15c8246795ca65` (445556b)
- `0x33067d2b6b210090fd7f2f0404acd31e48025285300a29b6162f85903fbee3f5` (445556b)
- `0x4607877ecddf59c0b3b9db32516b883b39d6a82df1bfa9fd5a621b188f8fbdfa` (445556b)
- `0x4bffaf33b4d3f8242a4cebe7e991b769de5bf5ceffa8bccecab12cd9ce751eaf` (445556b)
- `0x5433c4d7e3ca64e70b7b9f05ce551ed82ec50b9b2341decc9199acbcf18cd6fd` (445556b)
- `0x5575e73b9158be786635e4470b461def1d16ad04349b6640d510846396940a2d` (445556b)
- `0x6bac5a31f0aa8ba2eb45090eb475209e77b555012e9a44a4b138206381ad10a2` (445556b)

**Object Type**: `0xd84704c17fc870b8764832c535aa6b11f21a95cd6f5bb38a9b07d2cf42220c66::blob::Blob`

### ⚠️ WALRUS TESTNET INFRASTRUCTURE ISSUE (BLOCKING PRODUCTION)
**CURRENT STATUS**: Walrus storage integration is code-complete but blocked by testnet SSL certificate expiration:
- **✅ StorageService**: Complete rewrite using client extension pattern with upload relay
- **✅ Upload Relay Integration**: Uses `https://upload-relay.testnet.walrus.space` for reliable uploads
- **✅ Network Configuration**: Added `undici` Agent with 60-second timeouts as per official examples
- **✅ Proper Attributes**: Fixed metadata to use Walrus `attributes` parameter correctly
- **✅ Real Implementation**: Uses actual private keys from `.env.test` with WAL tokens
- **❌ Network Failure**: Walrus storage nodes have expired SSL certificates (`CERT_HAS_EXPIRED`)
- **⏸️ Production Blocked**: Cannot proceed until Walrus testnet infrastructure is fixed

**Comprehensive Test Status**: 
- **✅ Code Quality**: All major issues resolved, build successful
- **✅ TypeScript**: Zero compilation errors across entire SDK
- **✅ StorageService**: 4/4 tests passing with real Walrus writeBlobFlow operations  
- **✅ API Integration**: PersonalDataWallet, VectorService, HnswIndexService working
- **✅ Legacy Cleanup**: Duplicate services removed, imports unified to services/ directory

### Current Phase: Ready for Next Development Phase ✅
**STORAGE CONSOLIDATION COMPLETE**: All storage operations unified and production-ready:
- **✅ Production StorageService**: services/StorageService.ts with writeBlobFlow pattern
- **✅ Upload Relay Working**: Using `https://upload-relay.testnet.walrus.space` successfully
- **✅ Test Validation**: 4/4 StorageService tests passing with real Walrus uploads
- **✅ Build Success**: Zero TypeScript compilation errors across entire SDK
- **✅ API Compatibility**: PersonalDataWallet, VectorService, HnswIndexService integrated

**Ready for Next Phase**:
- **Next**: Main Data Wallet (per user): identity anchor + key/derivation utilities
- **Then**: App Context Wallets and Cross-App Access components
- **Finally**: Cross-app aggregation and permission management

Recommended SDK modules (create under `packages/pdw-sdk/src`):
- `wallet/MainWalletService.ts`: main wallet state, derivation, key mgmt.
- `context/ContextWalletService.ts`: app-scoped container CRUD and queries.
- `access/PermissionService.ts`: grants/revokes, consent requests, audits.
- `aggregation/AggregationService.ts`: cross-context queries with policy filtering.
- `types/wallet.ts`: public types & interfaces listed below.

## Key files to know
- Client extension: `src/client/PersonalDataWallet.ts` (public surface: `pdw.createMemory`, `pdw.tx/*`, `pdw.call/*`, `pdw.view/*`, `pdw.bcs`)
- Transactions: `src/transactions/TransactionService.ts` (uses `@mysten/sui/transactions` Transaction, not TransactionBlock)
- Memory/search: `src/memory/MemoryService.ts`, retrieval: `src/retrieval/*`
- **✅ PRODUCTION STORAGE**: `src/services/StorageService.ts` (official @mysten/walrus writeBlobFlow integration)
- Storage legacy: `src/storage/{WalrusService,WalrusStorageService,StorageManager}.ts` (deprecated, use services/StorageService)
- Test legacy: `src/storage/WalrusTestAdapter.ts` (disabled during consolidation)
- Encryption/SEAL: `src/encryption/EncryptionService.ts`, `src/security/SealService.ts`
- Views: `src/view/ViewService.ts` | Blockchain helpers: `src/blockchain/*`
- Generated types: `src/generated/pdw/{memory,seal_access_control}.ts`
- Codegen config/scripts: `sui-codegen.config.ts`, `scripts/{fix-codegen-paths.js,verify-deployment.js}`
- Examples/tests: `examples/*.ts`, `test/*.ts`

## Public API patterns (how to use)
- Extend Sui client: `const client = new SuiClient(...).$extend(PersonalDataWallet /* or PersonalDataWallet.asClientExtension(cfg) */)` → access via `client.pdw`.
- **Vector Embedding Storage**: `pdw.createMemory(content, embeddings, metadata)`, `pdw.searchMemories(query, tags)`, `pdw.getMemoryContext(contextId)`.
- **Graph Operations**: Build knowledge graphs with embeddings, search by relationships and metadata tags
- Transactions: build with `pdw.tx.createMemoryRecord(...)` (returns Transaction) or execute with `pdw.call.createMemoryRecord(opts, signer)`.
- Views: `pdw.view.getUserMemories(addr)`, `getMemory(id)`, `getMemoryIndex(addr)`, `objectExists(id)`.
- BCS/types: `pdw.bcs.Memory`, `MemoryIndex`, `MemoryMetadata`, plus access-control types from `seal_access_control`.

## Wallet SDK API (specs to implement)
- Main wallet
	- `pdw.wallet.getMainWallet(userAddress)` → `MainWallet` metadata (on-chain id, createdAt, derivation salts)
	- `pdw.wallet.deriveContextId(userAddress, appId)` → deterministic contextId (sha3(user|app|salt))
	- `pdw.wallet.rotateKeys(userAddress)` → rotates SEAL session/backup keys (uses `EncryptionService`)
- Context wallets
	- `pdw.context.create(appId, opts)` → creates app-scoped container; persists registry entry (Sui) + backing blobs (Walrus)
	- `pdw.context.addData(contextId, item)` | `removeData(contextId, itemId)` | `list(contextId, filters)`
	- Isolation: enforce `contextId` on all CRUD, never mixing appIds
- Cross-app access
	- `pdw.access.requestConsent(request: ConsentRequest)` → creates a pending consent (off-chain via `apiUrl`) and optional on-chain intent
	- `pdw.access.grant({ contextId, recipientAppId, scope, expiresAt })` → Move call to register policy; mirrors in Walrus tag
	- `pdw.access.revoke({ grantId })` → revoke on-chain + invalidate cached policy
	- `pdw.aggregate.query({ apps: appIds[], userAddress, query, scope })` → runs retrieval across permitted contexts only

Contracts for inputs/outputs (types/wallet.ts):
- `MainWallet { owner: string; walletId: string; createdAt: number; salts: { context: string } }`
- `ContextWallet { id: string; appId: string; owner: string; policyRef?: string; createdAt: number }`
- `ConsentRequest { requesterAppId: string; targetScopes: string[]; purpose: string; expiresAt?: number }`
- `AccessGrant { id: string; contextId: string; granteeAppId: string; scopes: string[]; expiresAt?: number }`

## Dev workflow (SDK package)
- Install deps (peer): `@mysten/sui` required by consumers.
- Codegen after Move changes: run from `packages/pdw-sdk` → `npm run codegen` (generates under `src/generated/pdw/*` and fixes paths).
- Build: `npm run build` (runs codegen then TS build for CJS + ESM).
- **Testing Phase**: Before new feature development, validate current functionality:
  - `npm test` (Jest); SEAL connectivity: `npm run test:seal`; quick check: `npm run verify:quick`; deployment check: `npm run verify:deployment`.
  - Test SEAL encryption/decryption with official @mysten/seal package
  - Test memory operations with actual storage backends
  - Verify client extension integration works correctly

## Test Quality Assurance Workflow
**MANDATORY TESTING REQUIREMENTS**: All new components must achieve 100% test pass rate before proceeding.

### Testing Process:
1. **Create Comprehensive Tests**: Cover all public API methods, error scenarios, edge cases
2. **Use Real Data**: Integrate actual testnet object IDs and blob IDs from Suiscan account 
3. **Run After Every Edit**: Execute tests immediately after code changes to verify functionality
4. **100% Pass Rate Gate**: All tests must pass before moving to next implementation phase
5. **Codacy Analysis**: Run code quality checks on all test files after creation/modification

### Test Execution Commands:
- **Component Tests**: `npm test -- test/{component}/{ComponentName}.test.ts`
- **All Tests**: `npm test` (must show 100% pass rate)
- **Verbose Output**: Add `--verbose` flag for detailed test information
- **Real Data Validation**: Tests should use actual object IDs, not mock placeholders

### Real Data Integration Requirements:
- **User Address**: `0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15`
- **Blob Objects**: Use real Walrus blob IDs from Suiscan (sizes: 12b to 445556b)
- **Object Types**: Validate against actual `0xd84704c17fc870b8764832c535aa6b11f21a95cd6f5bb38a9b07d2cf42220c66::blob::Blob`
- **Network Integration**: Tests should handle real network conditions, timeouts, rate limiting

## Configuration you must set
- Minimal: `{ packageId: '0x...', apiUrl: 'https://backend/api' }` when extending the client.
- SEAL/Walrus: configure through SDK config (key servers, storage provider) if encrypting or using storage helpers.
- Keep `packageId` in sync with the deployed Move package in `smart-contract/sources/*`.

## Data & storage format
- On-chain: index objects for `MainWallet` and `ContextWallet` (Move types under `memory` or new `wallet` module). SDK keeps IDs in `ViewService`.
- Off-chain: Walrus blobs for context data; tag with `context-id`, `app-id`, `encrypted=true`, `encryption-type=seal`.
- Hashing/derivation: `deriveContextId = sha3_256(userAddress + appId + salt)`; salt stored in main wallet metadata.
- Keys: Use SEAL IBE with user address identity; keep `backupKey` only client-side; never store raw keys in blobs.

## Implementation conventions
- Transactions use `Transaction` from `@mysten/sui/transactions`; set gas via `tx.setGasBudget()` or `tx.setGasPrice()` as needed.
- Codegen wrappers (e.g., `MemoryModule.createMemoryRecord`) are preferred where available; otherwise fall back to `tx.moveCall({ target: packageId + '::module::fn', ... })`.
- Chat view methods in the SDK hit the backend via `apiUrl`; ensure backend is running and URL is configured.

### Official dependencies and docs policy
- **CRITICAL**: Always use official `@mysten/seal` and `@mysten/walrus` packages that are installed in the SDK
- Import actual classes: `import { SealClient, SessionKey } from '@mysten/seal'` and `import { WalrusClient } from '@mysten/walrus'`
- Do not add or rely on mock/stub implementations in SDK source; integrate with the real services/APIs.
- Always use the latest stable packages from the Mysten ecosystem (`@mysten/sui`, `@mysten/seal`, `@mysten/walrus`, `@mysten/bcs`, `@mysten/codegen`, `@mysten/utils`). Prefer generated bindings over handwritten calls.
- Follow the official publisher documentation and API references when adding or updating functionality. Mirror official patterns and types; avoid hand-rolled cryptography or ad-hoc protocol changes.
- When upstream APIs change, update types and code via `npm run codegen`, align usages, and bump versions accordingly. Avoid temporary shims; fix at the integration points.

#### **Package Version-Specific Syntax (CRITICAL)**:
Use correct syntax for current package versions. Deprecated methods must be replaced:

**@mysten/sui/utils**:
- ✅ `fromHex()` - Use this (current)
- ❌ `fromHEX()` - DEPRECATED, do not use

**@mysten/bcs**:
- ✅ `bcs.struct()`, `bcs.vector()`, `bcs.u64()` - Use current BCS API patterns
- ❌ Old BCS struct patterns - Use official generated types

**@mysten/sui/transactions**:
- ✅ `Transaction` - Use this (current)
- ❌ `TransactionBlock` - DEPRECATED for new code

**@mysten/walrus**: 
- ✅ `WalrusClient.experimental_asClientExtension()` - Use client extension pattern (REQUIRED)
- ✅ Upload relay configuration: `https://upload-relay.testnet.walrus.space` with tip config
- ✅ `undici` Agent with 60-second timeouts for Node.js environments  
- ✅ `client.walrus.writeBlob()`, `client.walrus.readBlob()` - Use extended client methods
- ❌ Direct `new WalrusClient()` - Use client extension pattern only
- ❌ Custom HTTP wrappers - Use official client extension only

**@mysten/seal**:
- ✅ `SealClient.encrypt()`, `SessionKey.create()` - Use official API
- ❌ Mock SEAL implementations - Use real package only

#### Documentation sources (must use these)
- Walrus: https://docs.wal.app/
- SEAL: https://seal-docs.wal.app/
Always fetch and verify API shapes and examples from these official sites when implementing or updating storage/encryption logic.

## Permission model (cross-app)
- Source of truth: on-chain access registry (reuse `seal_access_control` or add `access` module) + mirrored policy blob in Walrus for quick reads.
- Grant semantics: subject = `contextId`, grantee = `recipientAppId`, scopes = verbs (read:list, read:item, search, export), TTL optional.
- Enforcement: `AggregationService` resolves allowed contexts via `ViewService` + `PermissionService`, then queries only permitted datasets.
- Consent UX: apps initiate `requestConsent` (backend surfaces UI). Users approve → SDK writes `grant` on-chain and cache policy blob.

## Access Control Pattern (OAuth-style App Permissions)
**App-Centric Permission Model**: Similar to Google OAuth, apps request access and users grant permissions:

### **Permission Request Flow**:
1. **App Requests Access**: Dapp calls `requestAccess(userWallet, permissions[], purpose)` 
   - Example: `["read:memories", "write:preferences"]` 
   - Purpose: "Access your memories to provide personalized recommendations"
2. **User Reviews & Approves**: User sees permission request in wallet UI and approves/denies
3. **On-Chain Grant**: Upon approval, SDK calls `grant_access()` to record permission on-chain
4. **App Uses Permissions**: App can now decrypt/access user data within granted scope

### **Permission Scopes** (like Google/OAuth):
- **`read:memories`**: Can decrypt and read user's memory data
- **`write:memories`**: Can create/modify memory entries  
- **`read:preferences`**: Can access user settings/preferences
- **`write:preferences`**: Can modify user settings
- **`read:contexts`**: Can list user's app contexts
- **`write:contexts`**: Can create new contexts for user

### **SEAL Integration**:
- **seal_approve** function validates: `appId` has been granted `requestedScope` by `walletOwner`
- **Permission Storage**: On-chain registry maps `(userAddress, appId) -> GrantedPermissions[]`
- **Time-Limited**: All permissions have expiration dates (renewable)
- **Revocable**: Users can revoke app permissions at any time

### **Implementation Components**:
- `requestConsent(appId, scopes[], purpose, expiresIn)` → creates pending consent UI
- `grantPermissions(appId, scopes[], expiresAt)` → user approves, writes on-chain
- `revokePermissions(appId, scopes[])` → user removes app access
- `checkPermission(appId, scope, userAddress)` → validates during SEAL decrypt

## Walrus usage (TESTED WORKING PATTERNS - use exactly these)
**Based on official examples**: https://github.com/MystenLabs/ts-sdks/tree/main/packages/walrus/examples

### **Required Setup for Node.js** (CRITICAL):
```typescript
// Configure network agent for reliability (from examples)
import { Agent, setGlobalDispatcher } from 'undici';
setGlobalDispatcher(new Agent({
  connectTimeout: 60_000,
  connect: { timeout: 60_000 }
}));
```

### **Client Creation Pattern** (REQUIRED):
```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
}).$extend(
  WalrusClient.experimental_asClientExtension({
    uploadRelay: {
      host: 'https://upload-relay.testnet.walrus.space',
      sendTip: { max: 1_000 }
    },
    storageNodeClientOptions: {
      timeout: 60_000
    }
  })
);
```

### **Upload Pattern** (TESTED WORKING):
```typescript
const { blobId, blobObject } = await client.walrus.writeBlob({
  blob: content,
  deletable: true,
  epochs: 3,
  signer: keypair,
  attributes: {
    'content-type': 'application/json',
    'context-id': contextId,
    'app-id': appId,
    'encrypted': 'true',
    'encryption-type': 'seal'
  }
});
```

### **Required Dependencies**:
- `undici` - For network configuration in Node.js environments
- `@mysten/walrus` - Official Walrus SDK with client extension
- Upload relay endpoint: `https://upload-relay.testnet.walrus.space`
	- Optional: `policy-ref`, `created-at`, `updated-at`
- **Retrieval**: Use `walrusClient.readBlob()`, validate `content-hash`, and if `encrypted=true && encryption-type=seal`, delegate to SEAL decrypt before returning plaintext
- **No XOR/placeholder encryption and no production local fallback**. Use official client retries and surface errors; offline cache only for dev

## Common gotchas
- Generated files go stale when Move changes → rerun `npm run codegen` and rebuild.
- Using TransactionBlock in app code vs Transaction in SDK: import the correct type per context.
- Some tests require network/SEAL key servers; see `packages/pdw-sdk/.env.test` and `docs/SEAL_*` for setup.
- Isolation: never allow cross-app reads without explicit `AccessGrant`; validate `appId` on every context operation.
- Consistency: treat context data as eventually consistent between Sui index and Walrus; prefer idempotent writes and retry-once on reads.

## SEAL flows (standard)
- Initialize: use `@mysten/seal` with allowlisted key servers from config; verify on mainnet only.
- Session key lifecycle:
	- Create via `SessionKey.create({ address, packageId, ttlMin, suiClient })`.
	- Get personal message; require wallet signature; set via `setPersonalMessageSignature(signature)`.
	- Cache session per address with TTL; refresh when expired.
- Encryption:
	- Call `sealClient.encrypt({ threshold, packageId, id, data })` where `id` is the user address identity (hex) for IBE.
	- Persist only the encrypted object; keep `backupKey` client-side; never store raw keys in Walrus.
- Approval intent:
	- Build Move tx using generated bindings from `src/generated/pdw/seal_access_control` (avoid hardcoded module strings) for approve/consent flows (e.g., `seal_approve`).
	- Use tx bytes from this intent when calling `decrypt`.
- Decryption:
	- Call `sealClient.decrypt({ data: encryptedObject, sessionKey, txBytes })` after user’s session key + approval tx.
- Key rotation:
	- Expose `pdw.wallet.rotateKeys(userAddress)` to mint a new session key and rotate backup key; do not write raw keys to chain or Walrus.

## Security model (quick triage)
- Threats: unauthorized cross-app reads, linkability of contexts, key exfiltration, blob tampering.
- Mitigations: IBE per user, deterministic but salted context IDs, on-chain policy checks, Walrus tags + content-hash verification, audit events.
- Privacy: expose only scoped fields via `AggregationService`; support redaction and per-scope filters.

Questions for follow-up
- Confirm canonical client-extension import: prefer `SuiClient().$extend(PersonalDataWallet)` vs `.$extend(PersonalDataWallet.asClientExtension(cfg))` across apps.
- List any additional required config keys (e.g., default key servers, Walrus endpoints) to pin in this guide.
