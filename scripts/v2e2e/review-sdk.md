# SDK V2 namespace review

Commit: `0da34fb4e647d182897f6cb86a7146a76c65e65e`
Branch: `henrynguyen/v2-e2e-testnet-spike`

Read-only review of the SDK V2 namespace implementation. Source was not modified.

Compared against `docs/architecture/v2-e2e-vertical-slice.md` and `services/contract/sources/namespace.move`.

## Focus checklist

| # | Check | Result |
|---|---|---|
| 1 | Move call argument order vs `namespace.move` | **Pass.** Every helper’s `moveCall` arguments match the Move signature (ctx omitted). `namespaceCoreArgs` is always `namespaceRegistry`, `accountRegistry`, `account`. Clock is last and is padded `0x6`. `cancel_uninitialized_namespace` is `public fun` and still goes through `tx.moveCall`. |
| 2 | Seal id 40-byte suffix vs contract | **Pass.** `namespaceSealKeyId` is 32-byte left-padded ID \|\| u64 LE. Matches `namespace::seal_key_id` and `test_seal_id_golden_vectors_are_little_endian_bcs` (`0xcafe` × v0/v1/v10000). |
| 3 | `wrapNamespaceDek`: 32-byte DEK, id hex, no `seal_approve` | **Pass.** Rejects non-32-byte DEK. `encrypt({ threshold, packageId, id: bytesToHex(suffix), data: dek })` — hex, no `0x`. Returns `{ wrappedDek }` only (`dek?: never`). No PTB / `seal_approve`. `@mysten/seal` prepends `BCS(packageId)` via `createFullId`. |
| 4 | `createNamespace` + `initializeKey` are separate txs | **Pass.** `executeMoveCall` builds one `Transaction` with one `moveCall` and `signAndExecute`s it. No batch helper. Test asserts `moveCalls.length === 1` for create. |
| 5 | `grantAccess` bool mapping / SHARE rules | **Pass vs chain.** WRITE without READ is upgraded to READ\|WRITE before send (contract would abort `EWriteRequiresRead` otherwise). SHARE without READ (and without WRITE) is rejected client-side (`EShareRequiresRead`). All-false rejected (`EInvalidPermissions` / use `revokeAccess`). Bools sent as `can_read, can_write, can_share`. SHARE→delegate and owner/`@0x0` are left to the contract (and dashboard). |
| 6 | Tests pin ABI, not mocks that always pass | **Partial.** Seal-id goldens are real. `createNamespace` spies `Transaction` + `addInput` and pins object order + clock. `initializeKey` / `cancelUninitializedNamespace` only check target + arity. `grantAccess` has no PTB spy. `revokeAccess` / `rotateKey` untested. |
| 7 | `tx.pure("vector<u8>", Array.from(...))` | **Pass.** Same pattern as `account.ts` `addDelegateKey` / `removeDelegateKey`. Two-arg `pure` BCS-encodes a length-prefixed vector; `tx.pure(uint8Array)` would be raw bytes and would be wrong. |

## ABI (verified)

Move signatures (ctx implicit) vs SDK `arguments`:

| Function | Move | SDK |
|---|---|---|
| `create_namespace` | `&mut NamespaceRegistry, &AccountRegistry, &MemWalAccount, String, &Clock` | `namespaceCoreArgs` + `pure("string", label)` + clock |
| `initialize_key` | `&NamespaceRegistry, &AccountRegistry, &MemWalAccount, &mut MemoryNamespace, vector<u8>, &Clock` | core + `namespaceId` + `pure("vector<u8>", Array.from(wrappedDek))` + clock |
| `grant_access` | `…, &mut MemoryNamespace, address, bool, bool, bool, &Clock` | core + ns + `pure("address", principal)` + read/write/share bools + clock |
| `revoke_access` | `…, address, vector<u8>, &Clock` | core + ns + principal + `newWrappedDek` + clock |
| `rotate_key` | `…, vector<u8>, &Clock` | core + ns + `newWrappedDek` + clock |
| `cancel_uninitialized_namespace` (`public fun`) | `…, &mut MemoryNamespace, &Clock` → `NamespaceCancelled` (`copy, drop`) | core + ns + clock; return unused (has `drop`) |

## Issues

### Issue 1 -- Severity: suggestion
- **File**: packages/sdk/test/namespace.test.mjs:282
- **Description**:
  Architecture asked tests to pin ABI, not just mocks that always pass. `createNamespace` does that (`namespace.test.mjs:187-257`: target, 5 args, registry/account/clock object order, 4th arg Pure).

  `initializeKey` is titled “includes wrapped_dek as vector<u8>” but only asserts `target === initialize_key` and `arguments.length === 6` (`:313-314`). It would still pass if:
  - object order were swapped
  - clock were omitted and a dummy 6th arg substituted
  - `tx.pure(wrappedDek)` were used (raw bytes, no BCS vector length prefix) instead of `tx.pure("vector<u8>", Array.from(...))`

  `grantAccess` has no PTB test at all (`:259-280` only the pre-send throws). A swap of `can_read` / `can_write` would still send three bools; READ-only grants would then hit `EWriteRequiresRead` on chain. `cancelUninitializedNamespace` is the same arity-only pin (`:349-353`). `revokeAccess` / `rotateKey` have zero coverage.

  Production argument lists currently match `namespace.move`. This is a test hole, not a live ABI bug.
- **Suggestion**:
  Reuse the `createNamespace` `addInput` spy for `initializeKey`, `grantAccess`, `revokeAccess`, `rotateKey`, and `cancelUninitializedNamespace`. Assert unresolved object ids in Move order, clock last, and decode Pure payloads (label `"notes"`; wrapped DEK `[1,2,3,4]` as BCS `vector<u8>`; grant bools for READ-only and WRITE-implies-READ).
- **Status**: open

### Issue 2 -- Severity: nit
- **File**: packages/sdk/src/namespace.ts:319
- **Description**:
  `resolveSealClient` silently drops a half-specified API key (`apiKeyName && apiKey`, else `{}`). `MemWalManual.normalizeSealServerConfigs` throws if only one of the pair is set, and `@mysten/seal` `SealClient` also rejects mixed pairs. A committee server that needs an API key then fails later inside `encrypt` with a less obvious error.
- **Suggestion**:
  Match Manual: require both `apiKeyName` and `apiKey`, or neither.
- **Status**: open
