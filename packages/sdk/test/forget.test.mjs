import assert from "node:assert/strict";
import test from "node:test";

import { MemWal } from "../dist/memwal.js";

function client(namespace) {
    return MemWal.create({
        key: new Uint8Array(32).fill(1),
        accountId: "0x1",
        serverUrl: "https://relayer.example",
        ...(namespace ? { namespace } : {}),
    });
}

function baseResponse(overrides = {}) {
    return {
        deleted: 1,
        forgotten: true,
        blob_id: "blob-abc",
        namespace: "demo",
        owner: "0xowner",
        ...overrides,
    };
}

/** Capture the signed request forget() issues, returning `response`. */
function capturing(memwal, response = baseResponse()) {
    const calls = [];
    memwal.signedRequest = async (method, path, body) => {
        calls.push({ method, path, body });
        return response;
    };
    return calls;
}

test("forget() POSTs the blob_id to the per-blob retraction route", async () => {
    // Deliberately NOT /api/forget, which is a namespace-wide hard delete that
    // restore can undo. The blob-scoped route is the durable one (WALM-392).
    const memwal = client("demo");
    const calls = capturing(memwal);

    await memwal.forget("blob-abc");

    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, "POST");
    assert.equal(calls[0].path, "/api/forget/blob");
    assert.equal(calls[0].body.blob_id, "blob-abc");
});

test("forget() defaults to the client's namespace", async () => {
    const memwal = client("demo");
    const calls = capturing(memwal);

    await memwal.forget("blob-abc");

    assert.equal(calls[0].body.namespace, "demo");
});

test("forget() sends an explicit namespace when given one", async () => {
    // Retraction is namespace-scoped server-side: the same ciphertext can be
    // indexed under two namespaces, and retracting one must not touch the
    // other. Sending the wrong namespace silently retracts nothing, so the
    // override has to reach the wire.
    const memwal = client("demo");
    const calls = capturing(memwal);

    await memwal.forget("blob-abc", "other-ns");

    assert.equal(calls[0].body.namespace, "other-ns");
});

test("forget() falls back to the default namespace when none was configured", async () => {
    const memwal = client();
    const calls = capturing(memwal);

    await memwal.forget("blob-abc");

    assert.equal(calls[0].body.namespace, "default");
});

test("forget() surfaces deleted=0 as a result, not an error", async () => {
    // A memory can already be un-indexed (expiry, an earlier cleanup) while its
    // blob is still on chain and still restorable. The retraction is recorded
    // either way, so zero rows removed is a success the caller can read.
    const memwal = client("demo");
    capturing(memwal, baseResponse({ deleted: 0, forgotten: true }));

    const result = await memwal.forget("blob-abc");

    assert.equal(result.deleted, 0);
    assert.equal(result.forgotten, true);
});

test("forget() reports forgotten=false for an already-retracted blob", async () => {
    // Idempotent repeat, not a failure.
    const memwal = client("demo");
    capturing(memwal, baseResponse({ deleted: 0, forgotten: false }));

    const result = await memwal.forget("blob-abc");

    assert.equal(result.forgotten, false);
    assert.equal(result.blob_id, "blob-abc");
});
