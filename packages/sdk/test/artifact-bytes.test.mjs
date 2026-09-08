import assert from "node:assert/strict";
import test from "node:test";
import { bytesToBase64, base64ToBytes, artifactBytesToUint8Array } from "../src/utils.ts";

test("artifact bytes roundtrip through standard base64", () => {
    const original = new Uint8Array([0, 1, 2, 254, 255, 10, 13]);
    const encoded = bytesToBase64(original);
    const decoded = base64ToBytes(encoded);
    assert.deepEqual(Array.from(decoded), Array.from(original));
});

test("artifactBytesToUint8Array encodes utf-8 strings", () => {
    const bytes = artifactBytesToUint8Array("hi");
    assert.deepEqual(Array.from(bytes), [104, 105]);
});
