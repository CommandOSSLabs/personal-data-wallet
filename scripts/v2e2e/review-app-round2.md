# Dashboard V2 namespace UI review — round 2

Commit: `23d8f8956c8a6fa2c6cb6596e099fd9c8dd306b1` (workspace at review time)
Previous review: `scripts/v2e2e/review-app.md` (`c798777e60eded986cf488bcd01dd8f4d5f62086`)
Branch: `henrynguyen/v2-e2e-testnet-spike`

Read-only re-review after the implementer’s fix commit. Source was not modified.

## Focus checklist

| # | Check | Result |
|---|---|---|
| 1 | JSON-RPC client is actually used for `queryEvents` / `devInspect`; gRPC shared client unchanged | **Pass.** `getV2JsonRpcClient()` builds a dedicated `SuiJsonRpcClient` from `config.suiRpcUrl` / `getJsonRpcFullnodeUrl(config.suiNetwork)` (same URL rules as `App.tsx` `jsonRpcUrlFor`, plus the local-e2e loopback path). `listOwnedV2Namespaces` and `lookupNamespacePermissions` call `queryEvents` / `devInspectTransactionBlock` only on that client. Shared dapp-kit client is still `SuiGrpcClient` whenever `VITE_SUI_GRPC_URL` is set (`App.tsx:63-67`). Account/delegate reads still go through `suiClientCompat` on `useSuiClient()`. |
| 2 | Event query is `Sender=owner`, not global `MoveEventType` cap | **Pass.** `queryEvents({ query: { Sender: ownerNormalized } })`, then JS-filter `::namespace::NamespaceCreated` (package-id matched). Cap is 100 pages × 50 of **this sender’s** events, not package-wide creates. After `createNamespace`, the row is `upsertNamespace`’d; `refresh` `mergeNamespaceRows`’s fetched + local-only ids. |
| 3 | Playground uses `v2AccountId` for active V2 labels (`playgroundMemwalAccountId`) | **Pass.** `Playground.tsx` destructures `v2AccountId` and passes it through `playgroundMemwalAccountId` into `MemWal.create`. Active V2 label → V2 account id; `default` / inactive / non-V2 labels keep the V1 session `accountObjectId`. Vitest covers the three cases. Namespace string is still the **label**. |
| 4 | Finish initialize + cancel exist | **Pass.** Uninitialized rows get **Finish initialize** (wrap + `initializeKey` + writer/delegate grants, named phases) and **Cancel reservation** (`cancelV2UninitializedNamespace` → SDK `cancelUninitializedNamespace`). Create upserts the reserved row before wrap/init, so a failed wrap still leaves those actions. Component test asserts both buttons. |
| 5 | Share skips owner / `0x0` | **Pass.** `sharePrincipalBlockedReason` blocks owner and `/^0x0+$/`. Grant is disabled and the helper is shown. `grantV2NamespaceAccess` re-checks against the wallet signer. Vitest covers owner, `0x0`, other, empty. |
| 6 | Seal configs from `VITE_SEAL_SERVER_CONFIGS` | **Partial.** Parser + wrap path exist (`config.sealServerConfigs` / `v2SealServerConfigs` first, then `VITE_SEAL_KEY_SERVERS` / network defaults; `VITE_SEAL_THRESHOLD` or `min(2, totalWeight)`). Spike env still does **not** set the VITE_ vars, so default wrap is still independent 2-of-2 vs relayer committee `0xb012` / threshold 1. See Issue 6. |
| 7 | UTF-8 byte length | **Pass.** `validateNamespaceLabel` uses `TextEncoder` (`1..=64` bytes). Vitest: 64 ASCII ok, 65 ASCII reject, 16 emoji ok, 17 emoji reject. |
| 8 | Dedupe labels | **Pass.** `playgroundNamespaceOptions` builds `['default', ...v2Labels, current]` through a `Set`. Vitest: `['memories', 'default', 'memories']` + current `notes` → `['default', 'memories', 'notes']`. |
| 9 | No new regressions (flag off still empty) | **Pass.** `v2NamespacesEnabled` is only `'true'`. `NamespacesSection` returns `null`; Dashboard mounts it only when the flag is on. Playground calls `useV2Namespaces('')` when the flag is off (no fetch) and keeps the free-text field. Component test: disabled → empty DOM; enabled + none → “No namespaces yet.” |

## Previous issues

### Issue 1 -- Severity: bug
- **File**: apps/app/src/utils/v2Namespace.ts:108-117, 362-375, 403-422
- **Description** (original): listing/ACL used `useSuiClient()` `queryEvents` / `devInspectTransactionBlock`. Shared client is gRPC on testnet; those methods do not exist.
- **Verification**:
  - Dedicated client: `new SuiJsonRpcClient({ url: v2JsonRpcUrl(), network: config.suiClientNetwork })`.
  - `listOwnedV2Namespaces` / `lookupNamespacePermissions` take `_suiClient` but do not call it for events/inspect.
  - `App.tsx` gRPC provider is unchanged.
  - `fetchV2AccountId` / `fetchV2DelegateAddresses` still use the shared client via `suiClientCompat`.
  - `useV2Namespaces` catch no longer wipes the list; a failed refresh keeps prior rows (and the create-path upsert).
- **Status**: fixed
- **Response**: Confirmed. Listing object hydration also uses the JSON-RPC client (`readV2NamespaceRow(rpc, id, owner)`); that is compatible (`fetchObjectJson` supports JSON-RPC) and is not a gRPC regression. Residual: a **first** refresh still sets `v2AccountId` only if listing **and** delegate fetch succeed (see Issue 9).

### Issue 2 -- Severity: bug
- **File**: apps/app/src/utils/v2Namespace.ts:31-32, 370-375
- **Description** (original): global `MoveEventType` `NamespaceCreated`, owner filtered in JS, hard-capped at 8×50 package-wide events.
- **Verification**: filter is `Sender: ownerNormalized`. Type/package filtered in JS (`eventIsNamespaceCreated`). `MAX_OWNER_EVENT_PAGES = 100`. Create upserts immediately; `mergeNamespaceRows` keeps local-only ids across a lagging event query.
- **Status**: fixed
- **Response**: Confirmed. Residual (not re-opened): the 100-page walk is **all** sender events, not only `NamespaceCreated`. A wallet with >5000 unrelated events can still drop old namespaces. Fine for this spike wallet; do not bring back a package-wide `MoveEventType` cap.

### Issue 3 -- Severity: bug
- **File**: apps/app/src/pages/Playground.tsx:194-220; apps/app/src/utils/v2Namespace.ts:257-266
- **Description** (original): V2 dropdown used labels, but `MemWal.create` still got the V1 session `accountObjectId`.
- **Verification**: `playgroundMemwalAccountId` returns `v2AccountId` iff some **active** row’s `label` equals the selected namespace. Playground wires that into `MemWal.create({ accountId: memwalAccountId, namespace })`. Vitest: `memories` (active) → V2; `default` → V1; `draft` (inactive) → V1. Health snippet also prints `memwalAccountId`.
- **Status**: fixed
- **Response**: Confirmed. Relayer auth still requires that same delegate key on the V2 account (operational, not a UI bug). Playground **manual** `MemWalManual` path is still V1 package/registry/session account (`Playground.tsx:572-598`); out of scope for this slice.

### Issue 4 -- Severity: suggestion
- **File**: apps/app/src/components/NamespacesSection.tsx:251-294, 528-551
- **Description** (original): no resume/cancel after wrap/init failed post-create.
- **Verification**: `handleFinishInitialize` → `initializeAndGrant` (named wrap / init / grant phases). `handleCancelReservation` → `cancelV2UninitializedNamespace`. Create upserts `keyInitialized: false` before wrap. Test `offers finish initialize and cancel on uninitialized rows`.
- **Status**: fixed
- **Response**: Confirmed. Grant stays disabled while `!selected.active`. Finish/Cancel are hidden once `keyInitialized` is true.

### Issue 5 -- Severity: suggestion
- **File**: apps/app/src/utils/v2Namespace.ts:246-255; apps/app/src/components/NamespacesSection.tsx:90, 298-302, 606-616
- **Description** (original): Share form submitted owner / `@0x0` and hit `EInvalidPrincipal`.
- **Verification**: helper copy (“The owner already has implicit access” / “The zero address cannot be granted access”); Grant `disabled={… Boolean(shareBlocked)}`; `grantV2NamespaceAccess` throws the same reason. Vitest covers owner, `0x0`, other, empty.
- **Status**: fixed
- **Response**: Confirmed. Tx4 `principalsToGrant` skip is unchanged and still unit-tested.

### Issue 6 -- Severity: suggestion
- **File**: apps/app/src/config.ts:21-54, 101-103; apps/app/src/utils/v2Namespace.ts:285-299, 431-445
- **Description** (original): wrap passed `sealServerConfigs`/`threshold`, but values were `VITE_SEAL_KEY_SERVERS` or hardcoded independent testnet/mainnet ids, `weight: 1`, no `aggregatorUrl`, threshold `min(2, totalWeight)`. Spike relayer `.env.v2e2e` uses committee `0xb012…` + `SEAL_THRESHOLD=1`. No `VITE_SEAL_SERVER_CONFIGS` analogue.
- **Verification**:
  - **Code analogue: yes.** `parseSealServerConfigsJson` accepts `{ objectId, weight, aggregatorUrl?, apiKeyName?, apiKey? }`. `v2SealServerConfigs()` prefers `config.sealServerConfigs`. `generateAndWrapNamespaceDek` passes those configs + `v2SealThreshold()` into the SDK. `config.ts` comments that the unwrap committee must match the relayer. `@mysten/seal` committee servers require `aggregatorUrl` (independent servers must not have one) — the JSON shape can carry it.
  - **Spike still wraps independent 2-of-2: yes.** `VITE_SEAL_SERVER_CONFIGS` / `VITE_SEAL_THRESHOLD` appear **only** in `config.ts`. They are absent from `scripts/v2e2e/ENV.md`, `apps/app/.env.example` (only commented `VITE_SEAL_KEY_SERVERS`), repo-root `.env.v2e2e` (has `SEAL_SERVER_CONFIGS` / `SEAL_THRESHOLD` for the relayer, no `VITE_` copies), and `docs/`. Vite exposes only `VITE_*` to `import.meta.env`; unprefixed `SEAL_SERVER_CONFIGS` is never read by the app. Unset → `DEFAULT_SEAL_SERVERS.testnet` (the two independent ids) and `min(2, 2) = 2`.
  - Invalid JSON is swallowed (`parseSealServerConfigsJson` `catch { return [] }`), so a typo also falls back to that mismatch with no dashboard error.
- **Suggestion**: Put the same JSON as relayer `SEAL_SERVER_CONFIGS` into `VITE_SEAL_SERVER_CONFIGS`, and `VITE_SEAL_THRESHOLD=1`, in `ENV.md` / spike env / `apps/app/.env.example`. Fail closed (or surface a banner) on invalid JSON instead of silent fallback. If `VITE_SEAL_SERVER_CONFIGS` is the 1-weight committee server, unset threshold already becomes `min(2, 1) = 1`; the missing object-id JSON is the actual wrap/unwrap break.
- **Status**: fixed
- **Response**: Invalid/non-array `VITE_SEAL_SERVER_CONFIGS` now sets `config.sealServerConfigsError` and does **not** fall back to independent 2-of-2. NamespacesSection banners the error and disables Create. Wrap throws the same message. `apps/app/.env.example` documents `VITE_SEAL_SERVER_CONFIGS` / `VITE_SEAL_THRESHOLD` next to `VITE_SEAL_KEY_SERVERS`. Unset env still uses `VITE_SEAL_KEY_SERVERS` / network defaults. Spike `.env.v2e2e` / `ENV.md` are outside this app commit.

### Issue 7 -- Severity: nit
- **File**: apps/app/src/utils/v2Namespace.ts:141-150
- **Description** (original): `validateNamespaceLabel` used JS string length; SDK/contract use UTF-8 bytes.
- **Verification**: `utf8ByteLength` via `TextEncoder`. Tests as in checklist #7.
- **Status**: fixed
- **Response**: Confirmed. Residual: the create `<input maxLength={64}>` is still UTF-16 code units, so 17–32 emoji can be typed and only fail on submit. Harmless; the contract-mismatch path is gone.

### Issue 8 -- Severity: nit
- **File**: apps/app/src/utils/v2Namespace.ts:268-276; apps/app/src/pages/Playground.tsx:201-204
- **Description** (original): `'default'` prepended, then V2 labels, duplicate `<option key="default">` if a V2 namespace is named `default`.
- **Verification**: `Set` in `playgroundNamespaceOptions`; Playground maps those strings. Vitest covers dedupe + `default` first.
- **Status**: fixed
- **Response**: Confirmed. If a V2 namespace is actually named `default`, the single option uses the V2 account id (`playgroundMemwalAccountId` matches the active label). That is consistent.

## New issues

### Issue 9 -- Severity: suggestion
- **File**: apps/app/src/hooks/useV2Namespaces.ts:43-55
- **Description**:
  `refresh` resolves `fetchV2AccountId` (gRPC) then `Promise.all([listOwnedV2Namespaces, fetchV2DelegateAddresses])`. `setV2AccountId(accountId)` runs only if **both** later calls succeed. A JSON-RPC listing/`devInspect`-unrelated `queryEvents` failure (public fullnode blip, rate limit) leaves `v2AccountId` at `null` on first load. Create stays disabled. Empty copy is “No V2 Walrus Memory account found for this wallet” even when the registry lookup already returned an id — the banner shows the listing error, the empty state tells a different story.

  After a successful load, a later listing failure no longer clears `v2AccountId` or the table (Issue 1 residual, good). The hole is only the first refresh.
- **Suggestion**:
  Set `v2AccountId` as soon as `fetchV2AccountId` returns. Catch listing and delegate fetches separately so Create is not blocked by `queryEvents`. Keep the listing error on the banner without lying about a missing account.
- **Status**: fixed
- **Response**: `refresh` now `setV2AccountId` as soon as `fetchV2AccountId` returns (including `null`). Listing and delegate fetches are caught separately; a `queryEvents` failure banners the listing error and does not clear a known account id. Empty copy “No V2 account” only when `v2AccountId` is still null. Component test: listing error + known account id does not claim a missing account.

## What looks correct (no issue)

- **Tx sequence** (`NamespacesSection.tsx:208-228`): sponsored `createV2Namespace` → `generateAndWrapNamespaceDek` → sponsored `initializeV2NamespaceKey` → per-principal sponsored `grantV2NamespaceAccess` READ|WRITE, no SHARE. Wrap is still client-side Seal (not a sponsored tx). Failures stay `{phase} failed: …`.
- **Wrapped DEK, not plaintext**: SDK `{ dek, wrappedDek }`; only `wrappedDek` reaches `initializeKey`.
- **Seal identity**: V2 `packageId`; 40-byte `namespaceSealKeyId` golden vectors unchanged.
- **SHARE gating**: checkbox disabled unless `isCurrentAccountDelegate`; bits forced off; submit guard; helper text.
- **gRPC Seal wrap**: `generateAndWrapNamespaceDek` still passes the shared client into `@mysten/seal`. Seal 1.x uses `client.core.getObject` / `getDynamicField`, which `SuiGrpcClient` implements — not another `queryEvents` footgun.
- **V1 kill switch** and Playground free-text when the flag is off or there are no **active** V2 labels.
- **Tests**: `v2Namespace.test.ts` (label bytes, grants, share block, playground account id, dedupe, seal-id); `NamespacesSection.test.tsx` (flag off, empty state, finish/cancel). No test asserts `queryEvents` is `{ Sender }` (regression risk for Issue 2, not a product bug).
