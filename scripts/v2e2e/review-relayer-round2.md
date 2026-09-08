# Relayer + sidecar V2 review — round 2

Commit: `c124bf470221ccb2c023fcc705514577d69933dc` (requested fix; workspace sources reviewed in place)
Previous review: `scripts/v2e2e/review-relayer.md` (`53ce8c60aec08a882b22817e52f3d027d4df40d0`)
Branch: `henrynguyen/v2-e2e-testnet-spike`

Read-only re-review after the implementer’s fix commit. Source was not modified.

Implementer marked Issues 1–4 **fixed**, Issue 5 **wontfix**. This pass checks those claims against current `auth.rs`, `storage/v2.rs`, `routes/remember.rs`, `jobs.rs`, `engine/walrus_seal.rs`, and `types.rs`.

## Focus checklist

| # | Check | Result |
|---|---|---|
| 1 | Hinted `x-account-id` cannot resolve to a different cached account | **Pass.** Hinted / `MEMWAL_ACCOUNT_ID` requests call `try_cached_account(..., Some(exact))` and skip any cache row whose `account_id` is not the same Sui object (0x-normalized). Miss → `verify_delegate_key_dual` on the hinted object (V1 type-origin, V2 only on `WrongObjectType`). Unhinted traffic still walks `{package}:{pubkey}` in V1-then-V2 order. |
| 2 | V2 remember/fence uses authorized pool index | **Pass on enqueue and on managed-oyster execution.** `authorize_v2_write` returns a **key-pool index**: HTTP `can_write`, then the first `KeyPool::keys()` slot whose derived address is in `MEMWAL_V2_WRITER_ADDRESSES` **and** `can_write`. That index is `writer_index` for both `V2WriteFence` and self-hosted `UploadAndTransfer`. `V2WriteFence` executes on `enqueued_wallet_index`. Self-hosted Apalis retries still rotate (new Issue 6). |
| 3 | self_hosted `insert_vector_v2` + recall envelope decrypt + recovery `v2-write-fence` | **Pass.** Success and recovery index with `storage_mode=self_hosted` (oyster columns NULL). Recall: `self_hosted` → Walrus GET + `decrypt_v2_envelope` (never Oyster, never V1 SEAL). `recovery_seal_persistence` rebuilds `SealPersistence::V2WriteFence` when `v2` is present (unit test pins this). Sidecar fills D1 before `namespace::write_fence`. |
| 4 | SELECT error does not fence; UPDATE must succeed before `insert_vector_v2` | **Pass.** `SELECT fence_tx_digest` errors map to `WalletJobError::Transient`. Non-empty digest skips the PTB. `UPDATE remember_jobs SET fence_tx_digest` is `?`’d; only then `insert_vector_v2`. Crash / first persist failure still re-fences (same hole the first review called out). |
| 5 | No new regressions on V1 path / `managed_oyster` default | **Pass.** V1 remember still `next_index()` + `v2_namespace_object_id: None` + `insert_vector`. `store_blob` / analyze / bulk / manual unchanged (live V2 label still 400/409). `MEMWAL_V2_MANAGED_OYSTER` still defaults true; `/version` `runtime.v2ManagedOyster` same. Managed oyster still PUT + fence-only PTB. Issue 6 is self-hosted-only. |

## Previous issues

### Issue 1 -- Severity: bug
- **File**: services/server/src/auth.rs:297-337, 413-468
- **Description** (original): Strategy 1 walked `{package}:{pubkey}` (V1 first) and returned the first live cache hit, ignoring signed `x-account-id`. Same HTTP agent on V1 + V2 accounts bound a V2 hint to the V1 row, so `resolve_live_v2_namespace` missed and remember/recall fell through to V1.
- **Verification**:
  - Hinted path: `account_id_hint.or(config.memwal_account_id)` → `try_cached_account(..., Some(exact_account_id))`.
  - `required_account_id` mismatch `continue`s (`same_sui_object_id` via `sui_sdk_types::Address`, padding/case).
  - Cache miss verifies the **hinted** object (`verify_delegate_key_dual`) and caches under `{package}:{pubkey}` with that object id — never the other package’s cached account.
  - Unhinted path still returns the first live package-scoped hit, then the V1 registry scan (testnet still fail-closes without a hint).
- **Status**: fixed
- **Response**: Confirmed. Hinted x-account-id cannot resolve to a different cached account. Inverse (V2 cache vs V1 hint) also skipped. Residual: unhinted mainnet traffic can still bind the first live V1 cache row; testnet requires the header.

### Issue 2 -- Severity: bug
- **File**: services/server/src/storage/v2.rs:352-382; services/server/src/routes/remember.rs:171, 824-850
- **Description** (original): `authorize_v2_write` picked a writer address; remember discarded it and used `key_pool.next_index()`. Sidecar only checked list membership for `keySlot`. N-key pool + one writer 403’d N-1 remembers. `writer_in_pool` unused.
- **Verification**:
  - `authorize_v2_write` → `Result<usize>`. HTTP principal `can_write`, empty writer list is Forbidden, then first pool key in the writer list that `can_write`.
  - Address derivation is `sui_address_from_private_key` (`suiprivkey1…` flag+32 or 32-byte hex); unit test matches Sui ED25519.
  - `spawn_prepare_v2_remember_job` uses `writer_index` (not `next_index`) for `V2WriteFence` and self-hosted `UploadAndTransfer`.
  - `V2WriteFence` execution stays on `enqueued_wallet_index`. Congestion requeue of self-hosted upload stays on the **executing** slot when `v2_namespace_object_id` is set.
  - V1 remember / bulk / `store_blob` still `next_index()`.
- **Status**: fixed
- **Response**: Confirmed for the enqueue bug and for managed-oyster fence execution. Residual: self-hosted `UploadAndTransfer` still runs `wallet_index_for_upload_attempt` on Apalis retries (Issue 6). A 1-key pool hides that, same as the original report.

### Issue 3 -- Severity: bug
- **File**: services/server/src/jobs.rs:759-785, 889-916, 967-994, 1248-1266, 1331-1340, 1543-1565; services/server/src/engine/walrus_seal.rs:334-341, 473-508
- **Description** (original): self-hosted V2 upload always `insert_vector` (NULL `namespace_object_id` / `storage_mode`). Recall treated the row as V1 and `account::seal_decrypt`’d the envelope. Recovery could only build `SealPersistence::V1New`.
- **Verification**:
  - Success: `self_hosted_v2_index` + `insert_vector_and_mark_remember_done` → `insert_vector_v2` with `storage_mode=self_hosted`, oyster columns `None`, D1 commitment / ciphertext digest / blob object id.
  - Upload persistence is `SealPersistence::V2WriteFence` when namespace id, key version, and both V2 registry ids are set.
  - Recovery job carries `v2: Some(...)`. `recovery_seal_persistence` returns `V2WriteFence` first; V1-new only when `v2` is `None`. Test `v2_metadata_recovery_rebuilds_write_fence_not_v1_new`.
  - Sidecar upload + set-metadata-batch fill 32-byte D1 from envelope+blob id before `namespace::write_fence`.
  - Recall fetch: `namespace_object_id` set **and** `storage_mode != self_hosted` → Oyster; `self_hosted` → Walrus aggregators. Decrypt: any row with `namespace_object_id` uses `decrypt_v2_envelope` (`can_read` + unwrap DEK + AES-GCM). NULL namespace id stays batched V1 `seal_decrypt`.
- **Status**: fixed
- **Response**: Confirmed. Residual (not re-opened): metadata-recovery enqueue uses `self_hosted_v2_index(...).ok()`. If D1 inputs were invalid, `v2` would be `None` and recovery would attach `V1New` — forbidden, but not reachable with the sidecar’s blob_id / object_id on this path. Fail closed with `?` like the success arm.

### Issue 4 -- Severity: bug
- **File**: services/server/src/jobs.rs:1017-1126
- **Description** (original): `SELECT fence_tx_digest` used `.unwrap_or(None)` (DB error looked like “no digest”). Persist `UPDATE` ignored errors, so a failed latch + failed `insert_vector_v2` re-fenced. Contract does not dedupe commitments.
- **Verification**:
  - SELECT: `.map_err(|e| WalletJobError::Transient(...))` — no fence on DB error.
  - Skip-if-nonempty digest unchanged (`filter(|d| !d.is_empty())`).
  - UPDATE `remember_jobs SET fence_tx_digest` must succeed (`?` Transient) **before** `insert_vector_v2`.
  - After a durable digest, insert failure retries skip the PTB.
- **Status**: fixed
- **Response**: Confirmed for both reported error paths. Residual (same as round 1): crash or Transient **between chain success and the first digest UPDATE** still re-fences; there is still no `MemoryWritten`-by-commitment search and no `vector_entries.fence_tx_digest` latch.

### Issue 5 -- Severity: suggestion
- **File**: services/server/src/storage/v2.rs:418-422, 672-702, 743-768
- **Description** (original): JSON-RPC dynamic-field `value` parsed only as string; `ensure_type` does not read `/result/data/type`; gRPC miss returns `None` and never falls back.
- **Verification**: Unchanged. gRPC client present → `ListDynamicFields` / `GetObject` only. JSON-RPC helpers still unused on the spike path (`SUI_GRPC_URL` required on testnet).
- **Status**: wontfix
- **Response**: Still wontfix. Not the dual-run write path.

## New issues

### Issue 6 -- Severity: bug
- **File**: services/server/src/jobs.rs:505-518, 1401-1405
- **Description**:
  Enqueue now pins the authorized writer on `WalletJob.wallet_index` (Issue 2). `V2WriteFence` honors that. Self-hosted V2 is `WalletOperation::UploadAndTransfer` with `v2_namespace_object_id: Some(_)`, and **every** `UploadAndTransfer` still does:

  `wallet_index_for_upload_attempt(enqueued, attempt, pool_size)` → attempt 1 = authorized slot, attempt 2 = `(start+1) % n`, …

  That rotation is the V1 gas-pool walk. For V2 it breaks D2+D4: PTB `ctx.sender()` must stay a `MEMWAL_V2_WRITER_ADDRESSES` member with WRITE.

  Failure mode (N keys, one granted writer at index `w`):
  1. Attempt 1 uses `w`, hits a Transient (RPC / slot / gas `balance::split`).
  2. Attempt 2 signs with a non-writer. Sidecar `/walrus/upload` does **not** check the writer list (only `/sui/v2-write-fence` does). Chain aborts `ENoWriteAccess`.
  3. `classify_sidecar_error` treats MoveAbort as **Permanent** → job Dead. The authorized wallet never gets the remaining attempts.

  Congestion requeue “stays on the same slot” uses the **already rotated** `wallet_index`, so a congestion after attempt > 1 pins the wrong signer.

  Default `managed_oyster=true` (Henry’s spike) is unaffected. 1-key pool hides it.
- **Suggestion**:
  If `v2_namespace_object_id` is set, execute and congestion-requeue on `enqueued_wallet_index` only (same as `V2WriteFence`). Do not call `wallet_index_for_upload_attempt`. Leave V1 rotation unchanged. Optionally classify sidecar writer-list 403 as Permanent for V2, but the relayer must not rotate onto a slot that would 403.
- **Status**: fixed
- **Response**: V2 `UploadAndTransfer` (`v2_namespace_object_id` is Some) now selects `enqueued_wallet_index` on every Apalis attempt via `wallet_index_for_self_hosted_upload`; empty pool is still Permanent. V1 still uses `wallet_index_for_upload_attempt` (attempt 1 = start, attempt 2 = `(start+1)%n`). Congestion requeue already stayed on the executing slot when the namespace id is set; after the pin that slot is the authorized writer. `V2WriteFence` unchanged. Unit test `v2_self_hosted_upload_stays_on_enqueued_writer_across_attempts`.

## What looks correct (no issue)

- **Hint cache compare** (`auth.rs:471-478`): `same_sui_object_id` unit-tested for padding and case.
- **`KeyPool::keys()`** (`types.rs:242-244`) is the list `authorize_v2_write` walks; pool is `config.sui_private_keys` at startup.
- **Managed oyster remember**: Oyster PUT, D1 commitment, `storage_mode=managed_oyster`, fence-only `V2WriteFence` on the authorized index.
- **D14 gate** still in front of remember / recall / recall-manual / analyze / bulk / manual. Analyze still 409s a live V2 label and enqueues with `v2_namespace_object_id: None`.
- **V1 `insert_vector`** unchanged (no V2 columns). Migration still additive nullable.
- **`runtime.v2ManagedOyster`** default true (`compatibility.rs:98-99`, `Config::from_env` `env_bool_or(..., true)`).
- **Unwrap / envelope decrypt** still DEK-in-memory only; job payloads store digests/commitment/oyster key, not DEK.
- **`write_fence` ABI** sidecar `appendV2WriteFence` still `id, nsRegistry, accountRegistry, account, namespace, commitment, clock`.
