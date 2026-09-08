# Relayer + sidecar V2 review

Commit: `53ce8c60aec08a882b22817e52f3d027d4df40d0`
Branch: `henrynguyen/v2-e2e-testnet-spike`

Read-only review of the relayer/sidecar V2 workstream. Source was not modified.

Compared against `docs/architecture/v2-e2e-vertical-slice.md`, `services/contract/sources/namespace.move`, and `scripts/v2e2e/summary-relayer.md`.

## Focus checklist

| # | Check | Result |
|---|---|---|
| 1 | Oyster PUT not POST; base already `/api/v1`; no extend; slash encoding | **Pass.** `put_blob` is `PUT`. `join_oyster_url` only concatenates; tests pin no `/api/v1/api/v1`. No extend/PATCH. `{namespace}/{job}` is percent-encoded so `/` is one path segment (`ns%2Fjob`). |
| 2 | Node `createHash("blake2b256")` | **Pass.** Not used. Node 22 OpenSSL exposes `blake2b512` / `blake2s256`, not `blake2b256`. Sidecar hashes via `@noble/hashes/blake2.js` `blake2b(..., { dkLen: 32 })`. Relayer uses `blake2::Blake2b<U32>`. |
| 3 | `write_fence` arg order vs `namespace.move`; never `account::seal_encrypt_fence` for V2 | **Pass on the happy path.** `appendV2WriteFence` is `id, nsRegistry, accountRegistry, account, namespace, commitment, clock` — matches Move. Managed oyster is fence-only `POST /sui/v2-write-fence`. Self-hosted upload uses `sealAbi: "v2-write-fence"`. **Fail on self-hosted recovery** (Issue 3). |
| 4 | Dual auth cache key includes package; V2 type origin | **Partial.** Cache key is `{package}:{pubkey}`. Hint verification retries V2 only on `WrongObjectType`. **Lookup still returns the first live cache hit (V1 first) and ignores `x-account-id`** (Issue 1). |
| 5 | D14: live V2 + writes off = 409, not V1 | **Pass.** `gate_v2_label` 409s `v2_writes_disabled` for a live namespace when `MEMWAL_V2_WRITES_ENABLED` is false. Remember / recall / recall-manual / analyze / bulk / manual all go through it before any V1 encrypt/upload. |
| 6 | HTTP `can_write` AND writer pool | **Fail.** HTTP principal is checked. Writer-pool check is “some listed address has WRITE”, then the PTB signer is round-robin `key_pool.next_index()` (Issue 2). |
| 7 | DEK never persisted; envelope D3 exact | **Pass.** DEK is only in the unwrap → AES-GCM sidecar round-trip. Job payloads / Postgres V2 columns store envelope metadata (digests, commitment, oyster key), not DEK. Envelope magic / version / AAD / 12-byte nonce / 16-byte tag / `ct_len` match D3 (golden test). |
| 8 | D1 preimage exact including `0x00` separator | **Pass.** Rust and TS both do `DOMAIN \|\| 0x00 \|\| ns[32] \|\| u64 LE \|\| blob_id_le[32] \|\| blob_object[32] \|\| blake2b256(envelope)`. Missing `pooled_blob_object_id` → 32 zero bytes. |
| 9 | never-double-fence on `fence_tx_digest` | **Partial.** Skip-if-set is implemented for managed oyster, but a failed `SELECT` is treated as “no digest” and the persist `UPDATE` ignores errors (Issue 4). |
| 10 | `/api/analyze` does not fence | **Pass.** Live V2 label → 409. Enqueued analyze jobs force `v2_namespace_object_id: None` / `v2_key_version: None`. |
| 11 | V1 path unchanged when flags false | **Pass** when V2 package IDs are unset, or when they are set but the label is not a live V2 namespace. Extra `UploadAndTransfer` fields are `#[serde(default)]`. Live V2 + writes off is D14 409, not a V1 behavior change. |
| 12 | Migration additive nullable | **Pass.** `010_v2_columns.sql` after `009_importance_signal.sql`. `ADD COLUMN IF NOT EXISTS` nullable on `vector_entries` and `remember_jobs`. No `NOT NULL`, no drops. |
| 13 | `/api/analyze` and bulk remember V2 | **Pass vs spec.** Analyze never fences (409). Bulk and `/api/remember/manual` reject a live V2 label (400 when writes on; 409 via `gate_v2_label` when writes off). |
| 14 | Recall decrypt path for oyster rows | **Pass for `managed_oyster`.** `namespace_object_id` → Oyster GET by key then `by-blob-id` → `can_read` → unwrap DEK → AES-GCM. V1 rows stay batched `seal_decrypt`. **Fail for `self_hosted`** (Issue 3). |

## Issues

### Issue 1 -- Severity: bug
- **File**: services/server/src/auth.rs:297
- **Description**:
  Dual-package cache keys are `{packageId}:{pubkey}` (`auth.rs:461-463`), and Strategy 2 verifies the signed `x-account-id` against V1 then V2 type-origin (`auth.rs:465-504`). Strategy 1 nevertheless walks `auth_package_ids` (V1 first) and **returns the first still-valid cache hit**, without comparing it to the signed hint (`auth.rs:299-342`). Strategy 2 never runs on a hit.

  Same HTTP agent on both accounts is the provision sequence (V1 dashboard delegate added to the V2 account). After any V1 request, `{v1_package}:{pk}` is populated. A later V2 `x-account-id` still resolves to the V1 account. `resolve_live_v2_namespace(v1_account, v2_label)` misses, so remember/recall fall through to V1 instead of Oyster/`write_fence` — breaking D14 and slice goals 5–6 even if the dashboard sends the V2 account id.

  The inverse is also true: a V2-only cache hit is returned for a V1 hint when the V1 row is absent/expired.
- **Suggestion**:
  When `x-account-id` is present, look up / verify that object (Strategy 2) before any package-scoped pubkey cache, or require `cached_account_id` to match the hint and otherwise fall through. Keep `{package}:{pubkey}` keys so a V2 row cannot be reused as a V1 type-origin hit.
- **Status**: fixed
- **Response**: Strategy 1 no longer returns the first V1 cache hit when `x-account-id` is present. Hinted requests only accept a cache row whose `account_id` matches the hint (0x-normalized); otherwise they verify the hinted object (V1 type-origin, then V2 on `WrongObjectType`) and cache under `{package}:{pubkey}`. Unhinted traffic still walks package-scoped cache keys, then the V1 registry scan.

### Issue 2 -- Severity: bug
- **File**: services/server/src/routes/remember.rs:829
- **Description**:
  D2+D4 requires HTTP principal `can_write` **and** PTB `ctx.sender() ∈ MEMWAL_V2_WRITER_ADDRESSES` with `can_write`. `authorize_v2_write` does the HTTP check and then returns the **first** listed writer that has WRITE (`v2.rs:350-373`). The caller discards that address (`remember.rs:828-829`) and later picks `state.key_pool.next_index()` (`remember.rs:170-176`).

  `POST /sui/v2-write-fence` only checks that `SERVER_SUI_ADDRESSES[keySlot]` is in the writer env list (`routes/v2.ts:61-68`), not that it is the address `authorize_v2_write` selected. `V2WriteFence` retries stay on `enqueued_wallet_index` (`jobs.rs:668-671`). A 403 body is classified Transient (`jobs.rs:1969`), so the same wrong slot is retried until the attempt budget dies.

  A 1-key pool where that key is the sole writer hides this. `SERVER_SUI_PRIVATE_KEYS` with N keys and a writer list of one address 403s on N-1 of N remembers. If every pool key is listed but only writer[0] was granted WRITE, the sidecar 200s and the chain aborts `ENoWriteAccess`. `writer_in_pool` is unused.
- **Suggestion**:
  Map `MEMWAL_V2_WRITER_ADDRESSES` onto key-pool indexes (derive addresses from `SERVER_SUI_PRIVATE_KEYS`). Persist the authorized index on `WalletOperation::V2WriteFence` (and self-hosted upload). Sidecar should keep the membership 403 as a belt-and-suspenders check, not the only binding.
- **Status**: fixed
- **Response**: `authorize_v2_write` now returns a **key-pool index**. It requires HTTP `can_write`, then picks the first `SERVER_SUI_PRIVATE_KEYS` slot whose derived Sui address is in `MEMWAL_V2_WRITER_ADDRESSES` **and** `can_write` on the namespace. `suiprivkey1…` / hex secrets are decoded the same way as Sui ED25519 (`bech32` flag+32, or 32-byte hex). That index is passed into `enqueue_wallet_job` / `V2WriteFence` / self-hosted `UploadAndTransfer`. V2 congestion requeues stay on the same slot (no round-robin). Sidecar writer-list 403 remains belt-and-suspenders.

### Issue 3 -- Severity: bug
- **File**: services/server/src/jobs.rs:1411
- **Description**:
  `MEMWAL_V2_MANAGED_OYSTER=false` encrypts a MEMWALV2 envelope and uploads it with `SealPersistence::V2WriteFence` (`remember.rs:237-256`, `jobs.rs:1132-1144`). After certify the sidecar fills D1 and calls `namespace::write_fence` in the transfer PTB (`walrus-upload.ts:313-325`) — that part is correct.

  Finalization always calls `insert_vector` (`jobs.rs:1411-1422`), never `insert_vector_v2`. `namespace_object_id` / `storage_mode` stay NULL. Recall then treats the row as V1 (`walrus_seal.rs:471-506`, `fetch_batch` `598-617`) and runs `account::seal_decrypt` on the envelope.

  Metadata-transfer recovery is worse: `recovery_seal_persistence` can only build `SealPersistence::V1New` (`jobs.rs:731-753`), so a failed self-hosted transfer retries `account::seal_encrypt_fence` for a V2 envelope — forbidden by the frozen constraint.

  Default `managed_oyster=true` (Henry’s spike path) is unaffected: oyster PUT + `insert_vector_v2` + envelope decrypt work.
- **Suggestion**:
  Thread `v2_namespace_object_id` / `key_version` / D1 fields through `execute_upload_and_transfer` and `SetMetadataAndTransfer`. Index with `insert_vector_v2` (`storage_mode=self_hosted`, no oyster key). Recall: if `storage_mode=self_hosted`, Walrus GET + envelope decrypt, never Oyster and never V1 SEAL. Recovery must re-attach `v2-write-fence`, not `v1-new`.
- **Status**: fixed
- **Response**: Successful self-hosted upload/recovery now `insert_vector_v2` with `storage_mode=self_hosted` (namespace id, key version, D1 commitment, ciphertext digest, blob object id; oyster columns stay NULL). Recall: `self_hosted` → Walrus GET + envelope decrypt (never Oyster, never V1 SEAL). `SetMetadataAndTransfer` recovery rebuilds `SealPersistence::V2WriteFence` (unit test pins this); the sidecar fills D1 from envelope+blob id before `namespace::write_fence`.

### Issue 4 -- Severity: bug
- **File**: services/server/src/jobs.rs:906
- **Description**:
  D9 skip-if-`fence_tx_digest` is the right shape (`jobs.rs:910-920`), but two error paths re-call `namespace::write_fence`:

  1. `SELECT fence_tx_digest` uses `.unwrap_or(None)` (`jobs.rs:901-906`). A transient DB error looks like “no digest”.
  2. The persist `UPDATE remember_jobs SET fence_tx_digest = $1` ignores the result (`jobs.rs:968-977`). If that write fails and `insert_vector_v2` also fails, the retry fences again.

  The contract does not dedupe commitments; a second successful PTB is a second `MemoryWritten`.
- **Suggestion**:
  Propagate the SELECT error as Transient (do not fence). Require the digest UPDATE to succeed before `insert_vector_v2`, or treat a digest already stored on `vector_entries` as fenced. Crash between chain success and persist is still a hole unless the relayer searches recent `MemoryWritten` events by commitment.
- **Status**: fixed
- **Response**: `SELECT fence_tx_digest` errors now map to `WalletJobError::Transient` (no fence). The `UPDATE remember_jobs SET fence_tx_digest` must succeed before `insert_vector_v2`; a failed persist is Transient so the retry sees the digest-or-retries-fence only after a durable latch. Skip-if-nonempty digest is unchanged.

### Issue 5 -- Severity: suggestion
- **File**: services/server/src/storage/v2.rs:664
- **Description**:
  JSON-RPC is documented as the gRPC `ListDynamicFields` fallback. `lookup_dynamic_field_json_rpc` only accepts `/result/data/content/fields/value` as a **string** (`v2.rs:688-694`). That works for `Table<vector<u8>, ID>` (namespace registry). It cannot load `Table<u64, KeyVersionState>` (wrapped DEK) or `Table<address, u8>` (permissions, numeric). `get_object_json_rpc` also returns the raw RPC envelope, while `ensure_type` only reads top-level `object_type` / `/type` (`v2.rs:219-222, 735-760`) — JSON-RPC type lives at `/result/data/type`.

  When `sui_grpc_client` is set, a gRPC miss returns `None` and never tries JSON-RPC (`v2.rs:410-414`). Testnet JSON-RPC is already retired in `auth.rs`, so the spike’s gRPC path is what matters; the fallback is still wrong if `SUI_GRPC_URL` is unset.
- **Suggestion**:
  Parse JSON-RPC `value` as object/bytes/number, and read `result.data.type`. Or drop the JSON-RPC branch and fail closed without gRPC, matching auth Strategy 3 on testnet.
- **Status**: wontfix
- **Response**: Spike path requires `SUI_GRPC_URL` (testnet JSON-RPC is retired; auth Strategy 3 already fail-closes on testnet without a hint). Namespace lookup uses gRPC `GetObject` + `ListDynamicFields`. The JSON-RPC helpers are unused when the gRPC client is configured and are not the dual-run write path. Parsing `value` as object/bytes/number and `result.data.type` would only matter for a non-gRPC fallback we do not exercise here.

## What looks correct (no issue)

- **Oyster HTTP** (`oyster.rs:44-48, 68-82, 191-208`): PUT, Bearer, raw body, no second `/api/v1`, `/` encoded, no extend.
- **D1 / D3** (`v2.rs:120-140`, `v2-envelope.ts:39-114`, `sidecar-v2-envelope.test.ts`): domain + `0x00` separator; envelope round-trip; 40-byte Seal suffix LE.
- **blake2b-256** (`v2-envelope.ts:43-45`, `Cargo.toml` `blake2`): not Node `createHash("blake2b256")`.
- **`write_fence` ABI** (`blob-metadata.ts:213-226`, `sidecar-v2-write-fence.test.ts:15-50`, `namespace.move:634-642`).
- **Unwrap policy** (`seal-ptb.ts:137-162`, `seal.ts:551-558`): `namespace::seal_approve(id, nsRegistry, accountRegistry, account, namespace)`. Wrap does not `seal_approve`.
- **D14 gate** (`v2.rs:336-347`) on remember, recall, recall-manual, analyze, bulk, manual.
- **Analyze does not fence** (`analyze.rs:83-90, 546-547`).
- **Managed oyster recall** (`walrus_seal.rs:189-317, 334-340, 478-485`): Oyster GET, `can_read`, unwrap, AES-GCM; V1 batch path unchanged for NULL `namespace_object_id`.
- **DEK not stored** (`remember.rs:145-167`; `010_v2_columns.sql`; `WalletOperation::V2WriteFence` has commitment/digest, no DEK).
- **Migration** (`migrations/010_v2_columns.sql`) additive nullable; V1 `insert_vector` unchanged.
- **`/version` flags** (`compatibility.rs:89-100`) from env, defaults match the architecture table (`v2ManagedOyster` default true).
