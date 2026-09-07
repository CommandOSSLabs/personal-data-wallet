import test from "node:test";
import assert from "node:assert/strict";
import { formatRestoreResult } from "../tools/restore.js";

test("memwal_restore warns when the API reports a truncated restore", () => {
    const text = formatRestoreResult(
        {
            namespace: "my-app",
            total: 25,
            restored: 10,
            skipped: 15,
            truncated: true,
        },
        10,
    );

    assert.match(text, /^Restore partially complete/);
    assert.match(text, /truncated=true/);
    assert.match(text, /More blobs remain to restore/);
    assert.match(text, /increase limit and call again/);
    assert.doesNotMatch(text, /Sidecar cap is saturated/);
});

test("memwal_restore does not tell agents to raise limit once the sidecar cap is saturated", () => {
    const text = formatRestoreResult(
        {
            namespace: "my-app",
            total: 100,
            restored: 20,
            skipped: 80,
            truncated: true,
        },
        20,
    );

    assert.match(text, /^Restore partially complete/);
    assert.match(text, /truncated=true/);
    assert.match(text, /Sidecar cap is saturated/);
    assert.match(text, /missing-blob page/);
    assert.doesNotMatch(text, /increase limit and call again/);
});

test("memwal_restore reports a finished page when restore is not truncated", () => {
    const text = formatRestoreResult({
        namespace: "my-app",
        total: 10,
        restored: 10,
        skipped: 0,
        truncated: false,
    });

    assert.match(text, /^Restore page finished/);
    assert.match(text, /truncated=false/);
    assert.match(text, /not proof the sidecar saw every blob/);
    assert.doesNotMatch(text, /More blobs remain to restore/);
    assert.doesNotMatch(text, /Restore complete/);
});

test("memwal_restore treats an omitted legacy truncated field as false", () => {
    const text = formatRestoreResult({
        namespace: "legacy",
        total: 1,
        restored: 1,
        skipped: 0,
    });

    assert.match(text, /^Restore page finished/);
    assert.match(text, /truncated=false/);
    assert.match(text, /not proof the sidecar saw every blob/);
});

// ── skipped_reasons breakdown (WALM-385) ───────────────────────────────
//
// A namespace whose ciphertexts predate a SEAL package change fails decrypt
// deterministically, lands in the relayer's permanent-failure cache, and
// from then on returns restored=0 skipped=N total=N on every call — the
// same counts a fully-restored namespace returns — while recall stays
// empty. These pin that the two stop rendering identically.

test("memwal_restore does not call a wholly permanently-failed namespace finished", () => {
    const text = formatRestoreResult(
        {
            namespace: "pre-migration",
            total: 19,
            restored: 0,
            skipped: 19,
            truncated: true,
            skipped_reasons: {
                already_indexed: 0,
                permanently_failed: 19,
                over_limit: 0,
                by_reason: { decrypt_permanent: 19 },
            },
        },
        10,
    );

    assert.match(text, /^Restore blocked/);
    assert.doesNotMatch(text, /Restore page finished/);
    assert.doesNotMatch(text, /Restore partially complete/);
    assert.match(text, /19 blob\(s\) permanently failed to restore/);
    assert.match(text, /decrypt_permanent=19/);
    assert.match(text, /will NOT recover them/);
    assert.match(text, /do not loop/);
});

test("memwal_restore lists every permanent-failure reason in a stable order", () => {
    const text = formatRestoreResult({
        namespace: "mixed",
        total: 4,
        restored: 1,
        skipped: 3,
        truncated: false,
        skipped_reasons: {
            already_indexed: 1,
            permanently_failed: 2,
            over_limit: 0,
            by_reason: { invalid_utf8: 1, decrypt_permanent: 1 },
        },
    });

    assert.match(text, /^Restore blocked/);
    assert.match(text, /\(decrypt_permanent=1, invalid_utf8=1\)/);
    assert.match(text, /already_indexed=1 {2}permanently_failed=2 {2}over_limit=0/);
});

test("memwal_restore keeps the benign wording when nothing permanently failed", () => {
    // Same restored=0 / skipped=19 counts as the blocked case above; the
    // only difference is why, so the warning must not fire here.
    const text = formatRestoreResult({
        namespace: "already-restored",
        total: 19,
        restored: 0,
        skipped: 19,
        truncated: false,
        skipped_reasons: {
            already_indexed: 19,
            permanently_failed: 0,
            over_limit: 0,
            by_reason: {},
        },
    });

    assert.match(text, /^Restore page finished/);
    assert.match(text, /already_indexed=19/);
    assert.doesNotMatch(text, /permanently failed to restore/);
    assert.doesNotMatch(text, /will NOT recover them/);
});

test("memwal_restore still tells agents to raise limit when blobs are only over_limit", () => {
    const text = formatRestoreResult(
        {
            namespace: "big",
            total: 30,
            restored: 10,
            skipped: 20,
            truncated: true,
            skipped_reasons: {
                already_indexed: 0,
                permanently_failed: 0,
                over_limit: 20,
                by_reason: {},
            },
        },
        10,
    );

    assert.match(text, /^Restore partially complete/);
    assert.match(text, /over_limit=20/);
    assert.match(text, /increase limit and call again/);
    assert.doesNotMatch(text, /will NOT recover them/);
});

test("memwal_restore renders a pre-WALM-385 relayer's response unchanged", () => {
    // Older relayers omit skipped_reasons entirely. The breakdown line must
    // not appear, and the existing wording must survive byte-for-byte.
    const legacy = formatRestoreResult(
        { namespace: "legacy", total: 19, restored: 0, skipped: 19, truncated: true },
        10,
    );

    assert.match(legacy, /^Restore partially complete/);
    assert.doesNotMatch(legacy, /skipped breakdown/);
    assert.doesNotMatch(legacy, /permanently failed to restore/);
    assert.equal(
        legacy,
        'Restore partially complete for namespace "legacy":\n' +
            "  total=19  restored=0  skipped=19  truncated=true\n" +
            "  ⚠️ More blobs remain to restore — increase limit and call again.",
    );
});

test("memwal_restore omits the breakdown line when nothing was skipped", () => {
    const text = formatRestoreResult({
        namespace: "clean",
        total: 3,
        restored: 3,
        skipped: 0,
        truncated: false,
        skipped_reasons: {
            already_indexed: 0,
            permanently_failed: 0,
            over_limit: 0,
            by_reason: {},
        },
    });

    assert.match(text, /^Restore page finished/);
    assert.doesNotMatch(text, /skipped breakdown/);
});

test("memwal_restore keeps paging when a poison blob sits beside restorable ones", () => {
    // GH #501: anyone can transfer a foreign Walrus blob carrying memwal_*
    // metadata into the owner's address. It fails SEAL decrypt once and is
    // negative-cached forever, so permanently_failed >= 1 is a permanent,
    // attacker-reachable state for an otherwise healthy namespace. Gating
    // the "stop retrying" wording on that alone would abandon a restore
    // that is 189/190 recoverable.
    const text = formatRestoreResult(
        {
            namespace: "work",
            total: 200,
            restored: 10,
            skipped: 190,
            truncated: true,
            skipped_reasons: {
                already_indexed: 0,
                permanently_failed: 1,
                over_limit: 189,
                by_reason: { decrypt_permanent: 1 },
            },
        },
        10,
    );

    assert.match(text, /^Restore partially complete/);
    assert.doesNotMatch(text, /Restore blocked/);
    // The permanent failure is still reported — it is real and the caller
    // should know one blob will never come back.
    assert.match(text, /1 blob\(s\) permanently failed to restore/);
    // ...but not with the instruction that contradicts the retry hint on
    // the very next line.
    assert.doesNotMatch(text, /do not loop/);
    assert.match(text, /189 skipped blob\(s\) are only over_limit/);
    assert.match(text, /increase limit and call again/);
});
