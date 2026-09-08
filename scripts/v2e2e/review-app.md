# Dashboard V2 namespace UI review

Commit: `c798777e60eded986cf488bcd01dd8f4d5f62086`
Branch: `henrynguyen/v2-e2e-testnet-spike`

Read-only review of the Dashboard V2 namespace UI. Source was not modified.

## Focus checklist

| # | Check | Result |
|---|---|---|
| 1 | Four separate steps: create → wrap DEK → initialize → grant writers+HTTP agent; failures named per step | **Pass.** Wrap is client-side Seal (not a sponsored tx), which matches the architecture (`wrap` does not call `seal_approve`). Create, initialize, and each `grantAccess` are separate sponsored txs via `useSponsoredTransaction`. Errors are prefixed with the phase (`Creating namespace failed`, `Wrapping namespace key failed`, `Initializing key failed`, `Granting read/write (i/n) failed`). |
| 2 | `generateAndWrapNamespaceDek` return value: SDK `{ dek, wrappedDek }` vs `initializeKey` bytes | **Pass.** App wrapper destructures `{ wrappedDek }` and returns only that `Uint8Array`. `NamespacesSection` passes that value into `initializeV2NamespaceKey`. Raw `dek` is discarded. |
| 3 | Seal wrap uses V2 `packageId` and 40-byte id | **Pass.** Wrapper calls SDK with `packageId: config.v2PackageId`, `keyVersion` default `0n`. SDK `encrypt({ id: bytesToHex(namespaceSealKeyId(...)) })` — 40-byte suffix, hex, no `0x`. App golden test matches Move LE vectors. |
| 4 | `grant_access` is wallet-to-wallet; SHARE disabled unless current delegate | **Pass.** Share field is a Sui address (`0x… wallet address`), not a delegate-key paste. SHARE checkbox is disabled unless `isCurrentAccountDelegate`; bits also force `canShare` false; `handleShare` re-checks. Create grants `canShare: false`. |
| 5 | Owner never granted (`EInvalidPrincipal`); `principalsToGrant` skips owner | **Pass for Tx4.** `principalsToGrant` skips owner, `@0x0`, and duplicates (unit-tested). **Gap:** the Share form does not apply the same skip (see Issue 5). |
| 6 | V1 unchanged when flag off | **Pass.** `v2NamespacesEnabled` is only `'true'`. `NamespacesSection` returns `null`; Dashboard mounts the section only when the flag is on. Playground keeps the free-text namespace field and still defaults to `default`. V1 `memwalPackageId` / `memwalRegistryId` defaults are untouched. |
| 7 | Playground passes namespace **label**, not object id | **Label: pass.** Options are `row.label`; `MemWal.create({ namespace })` gets the label string. **Account id: fail** — session `accountObjectId` is still the V1 account, so the relayer will not resolve the V2 `(account, label)` key (see Issue 3). |
| 8 | Listing via `NamespaceCreated` — missed namespaces if pagination/filter wrong | **Fail.** Global `MoveEventType` query, owner filtered only in JS, hard-capped at 8×50 events. Default testnet app client is gRPC and has no `queryEvents` (see Issues 1–2). |
| 9 | Wrap actually has `sealServerConfigs` / `threshold` in the dashboard call | **Pass at the API.** `generateAndWrapNamespaceDek` in `v2Namespace.ts` passes both into the SDK. Dashboard component does not pass them itself; the helper does. Committee/threshold values may still disagree with the relayer (see Issue 6). |

## Issues

### Issue 1 -- Severity: bug
- **File**: apps/app/src/utils/v2Namespace.ts:254
- **Description**:
  `listOwnedV2Namespaces` requires `suiClient.queryEvents`. The shared dapp-kit client is a `SuiGrpcClient` whenever `VITE_SUI_GRPC_URL` is set (`App.tsx:64-65`). Testnet `apps/app/.env.example` sets that URL. `SuiGrpcClient` has no `queryEvents` (JSON-RPC-only). Listing throws `This Sui client cannot query events; namespace listing needs JSON-RPC`.

  `useV2Namespaces` then wipes the list (`hooks/useV2Namespaces.ts:41-43`). `handleCreate` always `refresh()`s in `finally` (`NamespacesSection.tsx:175`), so a successful create still ends with an empty table plus that error.

  The same JSON-RPC-only assumption breaks ACL lookup: `lookupNamespacePermissions` requires `devInspectTransactionBlock` (`v2Namespace.ts:314-316`), which gRPC also lacks.
- **Suggestion**:
  Do not call JSON-RPC-only methods on `useSuiClient()`. Either (a) list from the owner’s transactions / registry live-reads using `suiClientCompat` helpers that already work on gRPC, or (b) keep a dedicated JSON-RPC client for event queries (same pattern as other dual-transport call sites). Reuse that path for `permissions` (dev-inspect or a gRPC `simulateTransaction` / table lookup).
- **Status**: fixed
- **Response**: Listing and ACL lookup no longer use `useSuiClient()`. `getV2JsonRpcClient()` builds a dedicated `SuiJsonRpcClient` from `config.suiRpcUrl` / `getJsonRpcFullnodeUrl(config.suiNetwork)` (same URL rules as `App.tsx` `jsonRpcUrlFor`). `listOwnedV2Namespaces` and `lookupNamespacePermissions` call `queryEvents` / `devInspectTransactionBlock` on that client only. Account/object reads still go through `suiClientCompat` on the shared gRPC client.

### Issue 2 -- Severity: bug
- **File**: apps/app/src/utils/v2Namespace.ts:261
- **Description**:
  Even on JSON-RPC, listing is `suix_queryEvents` with only `MoveEventType: ${v2PackageId}::namespace::NamespaceCreated`, `order: 'descending'`, `limit: 50`, at most `MAX_EVENT_PAGES = 8` (`v2Namespace.ts:29-30, 261-279`). Owner is applied **after** the page is fetched (`:271`). Sui event filters are a single variant, so this is “newest 400 NamespaceCreated events **package-wide**”, not “this wallet’s namespaces”.

  Any NamespaceCreated from other accounts consumes the cap. Henry’s older namespaces (or a namespace that just aged out of those 400 global events) never appear. Architecture asked for owner txs **or** NamespaceCreated via the Sui client; this is the global-type query with a silent truncate.
- **Suggestion**:
  Page `queryTransactionBlocks` / gRPC tx history `FromAddress: owner` and keep created `MemoryNamespace` objects, or query events by `Sender: owner` and keep `NamespaceCreated`. If `MoveEventType` is kept, do not stop at 8 pages while `hasNextPage` is true for this owner — walk until the owner’s creates are exhausted or use a cursor keyed on the owner. After create, the object id from `createNamespace` is already known; merge it into local state so refresh lag cannot hide the row just created.
- **Status**: fixed
- **Response**: Events are queried with Sui `Sender: owner` (not package-wide `MoveEventType`), then filtered to `::namespace::NamespaceCreated`. Paging walks the owner’s events up to 100 pages. After `createNamespace`, the new object is `upsertNamespace`’d immediately; `refresh` merges fetched rows with local-only ids so a lagging event query cannot hide the row just created.

### Issue 3 -- Severity: bug
- **File**: apps/app/src/pages/Playground.tsx:207
- **Description**:
  The V2 dropdown correctly uses **labels** (`Playground.tsx:196-210`, `option value={label}`). Relayer V2 resolution is `(auth.account_id, label)` (`services/server/src/storage/v2.rs:145-160, 336-342`). Playground still constructs `MemWal` with session `accountObjectId` from `useDelegateKey()` (`Playground.tsx:211`), which Dashboard/SetupWizard resolve against **V1** `config.memwalRegistryId`.

  `useV2Namespaces` already returns `v2AccountId` (V2 registry lookup) but Playground destructures only `namespaces`. Selecting a V2 label therefore sends `x-account-id: <v1 account>` + that label. `resolve_live_v2_namespace` misses (namespace is keyed by the V2 account id), so remember/recall fall through to V1 instead of Oyster/`write_fence`. That breaks slice goals 5–6 and D14 for the playground path.
- **Suggestion**:
  When the selected label is an active V2 namespace, pass `v2AccountId` into `MemWal.create`. Keep the V1 session account id only for `default` / non-V2 labels. The same delegate key must already be on the V2 account for relayer auth to accept that hint.
- **Status**: fixed
- **Response**: Extracted `playgroundMemwalAccountId`. When the selected label matches an **active** V2 namespace, `MemWal.create` uses `v2AccountId` from `useV2Namespaces`. `default` and non-V2 labels keep the V1 session `accountObjectId`. Covered by vitest.

### Issue 4 -- Severity: suggestion
- **File**: apps/app/src/components/NamespacesSection.tsx:119
- **Description**:
  Two-phase create is implemented, but there is no resume or cancel. If wrap or `initializeKey` fails after `createNamespace` succeeds, the label is reserved on-chain (`namespace.move` uniqueness key) and the row (when listing works) shows `uninitialized`. Grant is disabled when `!selected.active` (`NamespacesSection.tsx:474`). SDK already exports `cancelUninitializedNamespace`; the UI never calls it, and there is no “Initialize key” action on an existing inactive row. Henry cannot retry the same label without a side-channel PTB.
- **Suggestion**:
  On an uninitialized row, offer “Finish initialize” (wrap + `initializeKey` + grants) and “Cancel reservation” (`cancelUninitializedNamespace`). Keep failures named per step.
- **Status**: fixed
- **Response**: Uninitialized rows get **Finish initialize** (wrap + `initializeKey` + writer/delegate grants, named phases) and **Cancel reservation** (`cancelUninitializedNamespace`). A failed wrap/init after create leaves the reserved row in local state so those actions are available.

### Issue 5 -- Severity: suggestion
- **File**: apps/app/src/components/NamespacesSection.tsx:187
- **Description**:
  Tx4 correctly skips the owner via `principalsToGrant` (`v2Namespace.ts:189-206`). The Share form does not: any valid address including the owner or `@0x0` is submitted to `grant_access`, which aborts with `EInvalidPrincipal` (`namespace.move:800`). The user only sees a raw sponsored-tx error.
- **Suggestion**:
  Reuse `principalsToGrant` / the same owner+zero checks before `grantV2NamespaceAccess`. Disable Grant and show the same English helper as SHARE (“owner already has implicit access”).
- **Status**: fixed
- **Response**: `sharePrincipalBlockedReason` skips the owner (“The owner already has implicit access”) and `@0x0` (“The zero address cannot be granted access”). Grant is disabled and the helper is shown. Same check runs inside `grantV2NamespaceAccess`.

### Issue 6 -- Severity: suggestion
- **File**: apps/app/src/utils/v2Namespace.ts:209
- **Description**:
  Wrap **does** pass `sealServerConfigs` and `threshold` (`v2Namespace.ts:342-348`). Configs are `VITE_SEAL_KEY_SERVERS` or hardcoded independent testnet/mainnet object ids, each `weight: 1`, **no** `aggregatorUrl`. Threshold is `min(2, totalWeight)` (`:216-218`), not an env.

  Spike relayer `.env.v2e2e` uses a different committee (`SEAL_SERVER_CONFIGS` aggregator `0xb012…`, `SEAL_THRESHOLD=1`). App wrap under the independent 2-of-2 servers will not unwrap on that sidecar. Dashboard has no `VITE_SEAL_SERVER_CONFIGS` analogue.
- **Suggestion**:
  Mirror relayer Seal config in the app (object ids, weights, optional `aggregatorUrl`, threshold). At minimum document that `VITE_SEAL_KEY_SERVERS` must match `SEAL_SERVER_CONFIGS` or wrap/unwrap will disagree.
- **Status**: fixed
- **Response**: Added `VITE_SEAL_SERVER_CONFIGS` JSON (objectId, weight, aggregatorUrl, optional api keys) and `VITE_SEAL_THRESHOLD`. Wrap uses those first, then `VITE_SEAL_KEY_SERVERS` / network defaults. One-line comment in `config.ts`: unwrap committee must match the relayer.

### Issue 7 -- Severity: nit
- **File**: apps/app/src/utils/v2Namespace.ts:108
- **Description**:
  `validateNamespaceLabel` uses JS string length (`1..64` characters). SDK `assertLabel` and the contract use UTF-8 **byte** length (`1..=64`). A 40-emoji label passes the input `maxLength` and `validateNamespaceLabel`, then fails in `createNamespace` as `Creating namespace failed: … label must be 1..64 bytes`.
- **Suggestion**:
  Validate with `new TextEncoder().encode(label).length` so the dashboard error matches the SDK/contract.
- **Status**: fixed
- **Response**: `validateNamespaceLabel` uses `TextEncoder` UTF-8 byte length (`1..=64`), matching SDK `assertLabel` and the contract. Vitest covers ASCII overflow and 16 vs 17 emoji (4-byte) labels.

### Issue 8 -- Severity: nit
- **File**: apps/app/src/pages/Playground.tsx:200
- **Description**:
  `namespaceSelectOptions` always prepends `'default'` and then appends V2 labels. A V2 namespace actually named `default` produces duplicate `<option key="default">` entries. Harmless to the string passed to the SDK, noisy in the UI.
- **Suggestion**:
  Deduplicate labels (`['default', ...v2NamespaceLabels]` via a `Set`) while keeping `default` first.
- **Status**: fixed
- **Response**: `playgroundNamespaceOptions` builds `['default', ...v2Labels, current]` through a `Set`, so a V2 namespace named `default` is a single option. Vitest covers the dedupe.

## What looks correct (no issue)

- **Tx sequence** (`NamespacesSection.tsx:119-164`): sponsored `createV2Namespace` → `generateAndWrapNamespaceDek` → sponsored `initializeV2NamespaceKey` → per-principal sponsored `grantV2NamespaceAccess` READ|WRITE, no SHARE. Never batched with `createAccount`.
- **Wrapped DEK, not plaintext** (`v2Namespace.ts:342, 351`; `NamespacesSection.tsx:129-140`): SDK result is `{ dek, wrappedDek }`; only `wrappedDek` reaches `initializeKey`.
- **Seal identity** (`v2Namespace.ts:146-148, 342-348`; `v2Namespace.test.ts:66-74`): V2 package id; 40-byte `BCS(namespace_id) || u64 LE` golden vectors.
- **SHARE gating** (`NamespacesSection.tsx:75-79, 199-201, 452-466`): checkbox disabled + bits forced off + submit guard; helper text present.
- **Owner skip on Tx4** (`v2Namespace.ts:201`; `v2Namespace.test.ts:77-84`).
- **V1 kill switch** (`config.ts:127`; `NamespacesSection.tsx:254`; `NamespacesSection.test.tsx:60-64`; `Dashboard.tsx:1269`; `Playground.tsx:205, 712-719`).
- **Playground label vs object id** (`Playground.tsx:196-210`) — the remaining playground bug is the **account** id, not the namespace string.
- **Wrap kwargs** (`v2Namespace.ts:346-347`): `threshold` and `sealServerConfigs` are actually supplied (values may still be wrong; Issue 6).
