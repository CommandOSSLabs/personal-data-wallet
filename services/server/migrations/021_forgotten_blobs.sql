-- Permanent per-blob retraction list (WALM-392).
--
-- The write surface is append-only: a secret written by mistake — an API
-- key, a password, personal data the user never meant to store — lands on
-- Walrus, which has no delete, and is returned by every recall from then on.
-- `POST /api/forget` is not a remedy: it is namespace-wide (it destroys
-- everything, not the one bad write), and it is not durable, because
-- `/api/restore` rediscovers blobs purely from CURRENT on-chain ownership
-- and re-indexes any blob with no live `vector_entries` row. Deleting the
-- row is precisely what makes restore re-import it, so today the only
-- available remediation undoes itself on the next restore call.
--
-- This table is the durable half of `POST /api/forget/blob`: the retraction
-- record that survives the index row it removed. `restore()` unions these
-- blob_ids into the same "already accounted for, do not re-import" set it
-- builds from live rows and `restore_failed_blobs`, so a retracted memory
-- stays retracted.
--
-- WHY NOT A COLUMN ON vector_entries. Migration 020's header records the
-- approved WALM-363 design: no soft-delete column on `vector_entries`,
-- because ~21 production queries read that table and one missed filter
-- leaks content or over-counts storage. That reasoning applies with more
-- force here — the whole point of a retraction is that no read path can
-- miss it. Deleting the row instead of flagging it makes exclusion from
-- recall/ask/analyze/the read API a property of the schema rather than of
-- every future query author remembering a predicate. It also avoids adding
-- a partial HNSW index (an ACCESS EXCLUSIVE lock and a slow build inside
-- the boot-time migration chain) purely to keep vector search off dead rows.
--
-- WHY NOT memory_tombstones. That table looks like the natural home and is
-- not: it is swept at `TOMBSTONE_RETENTION` (30 days) because it exists to
-- drive Console's incremental-sync `deleted[]` feed, where a client that has
-- been away longer than retention is told to resync instead. Reusing it here
-- would silently expire the retraction — 30 days after forgetting a leaked
-- API key, the next restore would re-import it. A security control must not
-- inherit a cache's retention. `forget_blob` writes BOTH: a row here (the
-- permanent retraction) and a `memory_tombstones` row (so Console learns the
-- memory is gone), which is why this is a separate table rather than a
-- column on that one.
--
-- NEVER add this table to `sweep_expired_tombstones` or any other retention
-- sweep. Rows here are small (three short strings and a timestamp), bounded
-- by how many memories a user explicitly retracts, and expiring one silently
-- re-arms the exact resurrection this table exists to prevent.
--
-- Shape deliberately mirrors `restore_failed_blobs` (migration 010): the
-- same (owner, namespace, blob_id) primary key and the same owner+namespace
-- index, because it is consulted at the same point in `restore()` and for
-- the same reason — "do not download and re-index this blob for this owner
-- in this namespace." Namespace is part of the key, not dropped for
-- convenience: the same ciphertext can legitimately be indexed under two
-- namespaces (see `delete_by_blob_id`'s namespace scoping), and retracting
-- it from one must not silently retract it from the other.
CREATE TABLE IF NOT EXISTS forgotten_blobs (
    owner TEXT NOT NULL,
    namespace TEXT NOT NULL,
    blob_id TEXT NOT NULL,
    forgotten_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (owner, namespace, blob_id)
);

CREATE INDEX IF NOT EXISTS idx_forgotten_blobs_owner_ns
    ON forgotten_blobs (owner, namespace);
