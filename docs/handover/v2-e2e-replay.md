# V2 testnet E2E — replay sequence for another agent

English for the implementing agent. Chat with Henry in Vietnamese.

This is the **replay book** for the live testnet spike that proved the V2 on-chain spine + remember/recall on local filesystem Oyster. It is **not** “implement the whole PRD”.

## Hard constraints

- Work only in worktree `/Users/ducnmm/Documents/commandoss/MemWal-v2e2e`, branch `henrynguyen/v2-e2e-testnet-spike`.
- **Do not** touch `/Users/ducnmm/Documents/commandoss/MemWal` (WALM-429 worktree is dirty).
- **Do not** edit Linear.
- **Do not** point `DATABASE_URL` at Railway production.
- **Do not** merge this spike as “V2 complete”.
- **Do not** auto-extend Oyster/Walrus from Memory (PRD §5.1). No `oysterd extend`, no relayer cron.
- Phase 1 Console = list/identity only. Do not build Console decrypt.
- V2 memories call **only** `namespace::seal_approve` and `namespace::write_fence`. Never `account::seal_encrypt_fence`.
- `revoke_access` always rotates the DEK.

Bible (frozen product rules): `docs/architecture/v2-e2e-vertical-slice.md`.
Live object ids + passing digests: `scripts/v2e2e/STATE.md`.
Env template: `scripts/v2e2e/ENV.md`.
Secrets (gitignored): `scripts/v2e2e/.env.local` — copy from Henry, do not print.

## What this spike already proved (do not re-publish the package)

Testnet package `0xdf67385f0842bcdd7234b73d9822f1b29f7d7991115c219a589118d8c5501dfc`.

| Object | ID |
|---|---|
| AccountRegistry | `0x0e04320f37466a449d7bf6980bf8dad22d563da41faf98a0aab8b82c802eff86` |
| NamespaceRegistry | `0x1d0a9f1bf04832387fa911cbb83e59c99332439d93e89e1e868f23f5a08cb995` |
| MemWalAccount (owner Y) | `0x35fa85566a1033da3ece08d84cd93b15d737d9c989ae3019d44298f43fddaca1` |
| Clock | `0x6` |

Owner Y (`memwal-master`): `0x158a78f06e4a85cdef1a1f10bc30c41e4860c1a19f3b049a05098aca588593e7`.
Wallet B (READ grant, no private key in this flow): `0x3103b5ddad293bb00cf9b54061684293a829f2a65a7c560925e954f6e14a781f`.

Latest live namespace that passed the full ACL suite: `e2e-live-1788574260720` = `0x27f64ce284f7687f954c1b5e5b495311ccde2bcf49457177556df7b9f1222ec2` (v0 shredded; v1 still decrypts). **Create a new namespace** for a clean replay (`run-e2e.ts` does that by default).

## Goal of a replay

Reproduce this chain on testnet + local relayer/Oyster, see `ALL_E2E_PASS`:

1. `add_delegate_key` → `create_namespace` → Seal-wrap 32-byte AES DEK → `initialize_key`
2. `grant_access` HTTP agent WRITE, wallet B READ
3. `remember` ciphertext into Memory-owned Oyster + `namespace::write_fence`
4. `recall` returns plaintext
5. Unauthorized principal: `seal_approve` **MoveAbort 16**, `write_fence` **MoveAbort 17**
6. `rotate_key` v0→v1; v0 plaintext still recalls
7. `remember` v1; recall v1
8. Grant stranger READ; stranger `seal_approve` succeeds; `revoke_access` (rotates to v2); stranger `seal_approve` **MoveAbort 16**
9. `crypto_shred_key_version` v0; owner `seal_approve` v0 **MoveAbort 25**; recall v0 plaintext gone; v1 still decrypts

Abort codes (from `services/contract/sources/namespace.move`): `ENoReadAccess=16`, `ENoWriteAccess=17`, `EKeyVersionShredded=25`.

## 0. Code on disk

Uncommitted on this branch (needed for replay — do not revert):

- `packages/sdk/src/namespace.ts` — `cryptoShredKeyVersion`
- `packages/sdk/src/memwal.ts` — recall abort timeout **60s** (15s is too short for Seal unwrap on testnet)
- `scripts/v2e2e/run-e2e.ts` — full sequence + `--acl` resume

```bash
cd /Users/ducnmm/Documents/commandoss/MemWal-v2e2e
pnpm --filter @mysten-incubation/memwal test   # 36 passing, including shred PTB
```

## 1. Local services (order)

Need: Postgres `memwal_v2e2e`, Redis, Pearl, filesystem oysterd, relayer (spawns sidecar on :9000).

**Postgres / Redis** (OrbStack on this machine already listens on 5432 / 6379):

```
DATABASE_URL=postgresql://memwal:memwal_secret@127.0.0.1:5432/memwal_v2e2e
REDIS_URL=redis://127.0.0.1:6379
```

Create the DB if missing: `createdb memwal_v2e2e` (or equivalent). Never use Railway prod.

**Pearl** then **oysterd filesystem** (omit `SUI_RPC_URL` / `WALRUS_*` or slivers stall at `target_nodes=0`):

```bash
# pearl
export PEARL_BIND_ADDR=127.0.0.1:50051
export PEARL_SERVICE_SECRET=v2e2e-pearl-secret
export PEARL_MASTER_SEED=deadbeefcafebabe1234567890abcdef0102030405060708090a0b0c0d0e0f10
/Users/ducnmm/Documents/commandoss/oyster/target/debug/pearl

# oysterd — LocalBlobStore
mkdir -p /tmp/oyster-v2e2e/blob_store
export BIND_ADDR=127.0.0.1:3000
export DATABASE_URL="sqlite:/tmp/oyster-v2e2e/oyster.db?mode=rwc"
export BLOB_STORE_PATH=/tmp/oyster-v2e2e/blob_store
export PEARL_GRPC_URL=http://127.0.0.1:50051
export PEARL_SERVICE_SECRET=v2e2e-pearl-secret
/Users/ducnmm/Documents/commandoss/oyster/target/debug/oysterd serve
```

Create Oyster account + API key + bucket `v2e2e-ns` once; put the key in `.env.local` as `OYSTER_API_KEY`. `OYSTER_BASE_URL` **must include** `/api/v1` (relayer does not read `OYSTER_URL`).

Oyster PUT is `PUT`, not POST (curl default POST → 405).

**Relayer** (loads `.env.local`; sidecar is spawned):

```bash
# required overlays
RATE_LIMIT_DISABLED=true
ENOKI_FALLBACK_TO_DIRECT_SIGN=true   # Enoki does not allowlist namespace::write_fence
cd /Users/ducnmm/Documents/commandoss/MemWal-v2e2e/services/server
# env from scripts/v2e2e/.env.local then:
cargo run
```

Health:

```bash
curl -sS http://127.0.0.1:8000/health
curl -sS http://127.0.0.1:8000/version   # need runtime.v2WriteFence=true
curl -sS http://127.0.0.1:9000/health
curl -sS -H "Authorization: Bearer $OYSTER_API_KEY" http://127.0.0.1:3000/api/v1/buckets
```

Sui: use **gRPC** `SUI_GRPC_URL=https://mysten-rpc.testnet.sui.io`. Public JSON-RPC is dead (`MethodNotFound` / `queryEvents` fails). Dashboard list may still `Failed to fetch` for that reason — not a contract bug.

## 2. `.env.local` (gitignored)

Must exist at `scripts/v2e2e/.env.local`. Template: `scripts/v2e2e/ENV.md`.

Critical keys (values from Henry, do not log):

- `SERVER_SUI_PRIVATE_KEY` / `SERVER_SUI_PRIVATE_KEYS` — owner Y, also the operator writer
- `MEMWAL_V2_*` package/registry ids (table above)
- `MEMWAL_ACCOUNT_ID` — Y’s account
- `MEMWAL_V2_WRITER_ADDRESSES` — Y’s address
- `MEMWAL_V2_NAMESPACES_ENABLED=true`, `MEMWAL_V2_WRITES_ENABLED=true`, `MEMWAL_V2_MANAGED_OYSTER=true`
- `SEAL_SERVER_CONFIGS` + `SEAL_THRESHOLD=1` (committee objectId + aggregatorUrl)
- `OYSTER_BASE_URL=http://127.0.0.1:3000/api/v1`, `OYSTER_API_KEY`, `OYSTER_BUCKET=v2e2e-ns`
- `ENOKI_FALLBACK_TO_DIRECT_SIGN=true`

`MEMWAL_PACKAGE_ID` on this spike is the **V2** package (dual-run). Do not mix staging V1 package ids into V2 writes.

## 3. Run the script

From repo root:

```bash
cd /Users/ducnmm/Documents/commandoss/MemWal-v2e2e
pnpm exec tsx scripts/v2e2e/run-e2e.ts
```

Flags:

| Flag | What |
|---|---|
| (none) | New namespace + remember/recall + full ACL/rotate/shred |
| `--acl` | Resume from `scripts/v2e2e/.secrets/e2e-run.json` (ns already created, v0 memory exists). **Do not use on a ns whose v0 is already shredded.** |
| `--resume` | Remember again + recall, then stop |
| `--recall-only` | Recall only, then stop |

Each full run `add_delegate_key`s a new key (on-chain cap **20**). If that fails, reuse a saved delegate from the artifact.

Success line: `ALL_E2E_PASS {json}`.

SDK recall used to abort at 15s (`AbortError: This operation was aborted`) while Seal unwrap was still in flight. Timeout is now 60s. If it still aborts, retry; do not treat AbortError as an ACL failure.

## 4. Exact tx sequence (`run-e2e.ts`)

All namespace PTBs go through SDK (`createNamespace`, `initializeKey`, `grantAccess`, `rotateKey`, `revokeAccess`, `cryptoShredKeyVersion`) with `SuiGrpcClient`. Unauthorized / expected-abort calls are raw `namespace::seal_approve` / `namespace::write_fence` signed by a **fresh funded** Ed25519 key (not a delegate).

```
add_delegate_key(agent)
create_namespace(label = e2e-live-<ts>)          # inactive
Seal encrypt 32-byte DEK, id = hex(namespaceSealKeyId(ns, 0))
initialize_key(wrappedDek)                       # activates, key v0
grant_access(agent, READ|WRITE)
grant_access(wallet B, READ)
remember(v0 text "peanut allergy …")             # Oyster PUT + write_fence as writer Y
recall("peanut allergy") → plaintext

generate stranger keypair, fund 0.1 SUI from Y
stranger seal_approve(v0)  → abort 16
stranger write_fence(v0)   → abort 17   # 32-byte dummy commitment, current-version seal id

Seal-wrap new DEK for keyVersion=1
rotate_key(newWrappedDek)                        # v0 retired, current=1
recall v0 still plaintext
remember(v1 text "rotated key …")
recall v1 plaintext

grant_access(stranger, READ)
stranger seal_approve(v1)  → success
Seal-wrap DEK for keyVersion=2
revoke_access(stranger, newWrappedDek)           # removes ACL + rotates to v2
stranger seal_approve(v1)  → abort 16
agent recall v0 still plaintext

crypto_shred_key_version(0)
owner seal_approve(v0)     → abort 25
recall "peanut allergy"    → v0 plaintext absent
recall "rotated key"       → v1 plaintext present
```

Seal ID suffix is 40 bytes: `BCS(namespace_id) || BCS(u64 LE key_version)`. Contract checks suffix only.

`write_fence` is `public fun` (drop return). Commitment length 32 is checked **before** `can_write`, so unauthorized fence tests must pass a 32-byte commitment and the **current** key-version seal id.

## 5. Envelope / commitment (do not invent a new one)

Envelope magic `MEMWALV2`. AES-256-GCM under the **namespace** DEK (not Seal-the-payload).

D1 commitment:

```
DOMAIN = b"memwal.v2.write_commitment.v1"
preimage = DOMAIN || 0x00 || ns[32] || kv_le[8] || blob_id_le[32] || blob_object[32] || ct_digest[32]
```

Filesystem Oyster: `blob_id` may be **64-hex**, not base64url — decode path already in relayer/SDK. `pooled_blob_object_id` may be null → 32 zero bytes.

## 6. Known landmines

- Enoki 400 `namespace::write_fence` not allowlisted → must `ENOKI_FALLBACK_TO_DIRECT_SIGN=true`. Durable policy `directSignAfterSponsorFailure:false` will block fallback.
- Public fullnode JSON-RPC sunset → SDK on-chain uses `SuiGrpcClient`.
- Oyster + Walrus objects: `target_nodes=0` hang. Filesystem store is enough for this proof.
- Relayer default HTTP client 30s killed Walrus-backed Oyster PUT; dedicated Oyster client is 300s.
- Hex 64-char `blob_id` from filesystem oysterd must not go through base64url-only decode.
- `sui client ptb` splitting `x"hex"` — use `--make-move-vec` if driving PTBs by hand.
- Dashboard Namespaces list uses `queryEvents` on JSON-RPC → `Failed to fetch`. Ignore for this replay.
- Do not GET the old Walrus-backed spike blob (~66MB encoded unit); it hangs. Health-check Oyster via `GET /buckets`.

## 7. Out of scope (do not start unless Henry says so)

Parked on this branch (not V2 complete): artifacts store/get/list without embedding (Playground accordion + SDK/MCP); dashboard Access column; grant-to-wallet UI hidden.

PRD still missing after this spike: canonical index & public API, V1→V2 migration, observability/recall-trace/audit log, receipts + hash-chain + open verifier, Python/MCP V2 parity, Console decrypt, Oyster byte-delete/expiry, file embedding, portability, metering, `createSharedNamespace`, SHARE-role live test, `crypto_shred_namespace` UI, deactivate/reactivate, production merge (flags default **off**).

## 8. If Henry only wants “run it again”

1. Confirm `.env.local` exists and services are healthy.
2. `pnpm exec tsx scripts/v2e2e/run-e2e.ts`
3. Record new digests into `scripts/v2e2e/STATE.md`.
4. Stop. Do not open a PR. Do not touch Linear. Do not touch WALM-429.
