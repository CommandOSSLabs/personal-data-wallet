-- Hashed identifier tokens for hybrid / lexical recall (WALM-444).
--
-- Production memory text stays on Walrus behind SEAL. This column stores
-- HMAC-SHA256 hex of high-entropy terms extracted at write time (addresses,
-- UUIDs, Sui object ids, snake/camel identifiers, version tags), keyed by
-- owner + LEXICAL_INDEX_PEPPER. A database dump cannot reconstruct plaintext.
-- Empty array is the default so existing rows stay cosine-only until rewritten.

ALTER TABLE vector_entries
    ADD COLUMN IF NOT EXISTS lexical_tokens TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_vector_entries_lexical_tokens
    ON vector_entries USING gin (lexical_tokens);
