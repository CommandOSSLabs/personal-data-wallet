-- Artifacts are encrypted file payloads (MEMWALV2 envelope) stored in Oyster.
-- They are NOT inserted into vector_entries — no embedding until a later model.

CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,
    owner TEXT NOT NULL,
    namespace TEXT NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'upload',
    byte_size BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running',
    blob_id TEXT,
    error_msg TEXT,
    namespace_object_id TEXT,
    key_version BIGINT,
    storage_mode TEXT,
    oyster_bucket TEXT,
    oyster_key TEXT,
    pooled_blob_object_id TEXT,
    ciphertext_digest BYTEA,
    commitment BYTEA,
    fence_tx_digest TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_owner_ns_created
    ON artifacts (owner, namespace, created_at DESC);

ALTER TABLE vector_entries
    ADD COLUMN IF NOT EXISTS source_artifact_id TEXT;
