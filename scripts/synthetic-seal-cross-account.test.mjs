import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { extractAbortCode } from "./synthetic-seal-cross-account.mjs";

const SCRIPT = fileURLToPath(new URL("./synthetic-seal-cross-account.mjs", import.meta.url));
const E_NO_ACCESS = 100;

// Verbatim JSON-RPC Display string from a sui_devInspectTransactionBlock
// effects.status.error (a string, not a structured object). Nested commas
// inside MoveLocation must not hide abort code 100.
const JSON_RPC_SEAL_ENOACCESS =
    'MoveAbort(MoveLocation { module: ModuleId { address: ..., name: Identifier("account") }, function: 25, instruction: 11, function_name: Some("seal_approve") }, 100) in command 0';

const JSON_RPC_SEAL_ENOACCESS_HEX =
    "MoveAbort(MoveLocation { module: ModuleId { address: " +
    "0000000000000000000000000000000000000000000000000000000000000abc, " +
    'name: Identifier("account") }, function: 25, instruction: 11, ' +
    'function_name: Some("seal_approve") }, 100) in command 0';

function inspectFailure(error) {
    return { effects: { status: { status: "failure", error } } };
}

function classifyNegative(inspect) {
    const result = extractAbortCode(inspect);
    if (result.outcome === "success") return "security-fail";
    if (result.outcome === "abort" && result.code === E_NO_ACCESS) return "deny";
    return "misconfig";
}

const SECRET_KEYS = [
    "SEAL_CROSS_ACCOUNT_A_ID",
    "SEAL_CROSS_ACCOUNT_B_ID",
    "SEAL_CROSS_ACCOUNT_A_KEY",
    "SEAL_CROSS_ACCOUNT_B_KEY",
    "MEMWAL_ACCOUNT_A_ID",
    "MEMWAL_ACCOUNT_B_ID",
    "MEMWAL_DELEGATE_KEY_A",
    "MEMWAL_DELEGATE_KEY_B",
];

function spawnScript(envExtra = {}, args = []) {
    const env = { ...process.env, ...envExtra };
    for (const key of SECRET_KEYS) {
        if (!(key in envExtra)) delete env[key];
    }
    return spawnSync(process.execPath, [SCRIPT, ...args], {
        env,
        encoding: "utf8",
    });
}

test("JSON-RPC MoveAbort Display string with nested location commas is ENoAccess", () => {
    const result = extractAbortCode(inspectFailure(JSON_RPC_SEAL_ENOACCESS));
    assert.equal(result.outcome, "abort");
    assert.equal(result.code, E_NO_ACCESS);
    assert.equal(classifyNegative(inspectFailure(JSON_RPC_SEAL_ENOACCESS)), "deny");
});

test("production-like JSON-RPC MoveAbort with hex ModuleId address is ENoAccess", () => {
    const result = extractAbortCode(inspectFailure(JSON_RPC_SEAL_ENOACCESS_HEX));
    assert.equal(result.outcome, "abort");
    assert.equal(result.code, E_NO_ACCESS);
    assert.equal(classifyNegative(inspectFailure(JSON_RPC_SEAL_ENOACCESS_HEX)), "deny");
});

test("comma-excluding regex cannot reach abort code 100 in the JSON-RPC string", () => {
    assert.equal(JSON_RPC_SEAL_ENOACCESS.match(/MoveAbort\([^,]+,\s*(\d+)\)/), null);
    assert.equal(JSON_RPC_SEAL_ENOACCESS_HEX.match(/MoveAbort\([^,]+,\s*(\d+)\)/), null);
});

test("simple MoveAbort without nested location commas still parses", () => {
    const result = extractAbortCode(
        inspectFailure("MoveAbort(MoveLocation { module: 0x2::account }, 100) in command 0"),
    );
    assert.equal(result.outcome, "abort");
    assert.equal(result.code, E_NO_ACCESS);
});

test("formatMoveAbortMessage abort code phrase is ENoAccess", () => {
    const result = extractAbortCode(
        inspectFailure(
            "MoveAbort in 1st command, abort code: 100, in '0xabc::account::seal_approve' (instruction 11)",
        ),
    );
    assert.equal(result.outcome, "abort");
    assert.equal(result.code, E_NO_ACCESS);
});

test("structured MoveAbort object fallback still works", () => {
    const result = extractAbortCode(
        inspectFailure({ MoveAbort: [{ module: "account", function_name: "seal_approve" }, 100] }),
    );
    assert.equal(result.outcome, "abort");
    assert.equal(result.code, E_NO_ACCESS);
});

test("same-account success is not classified as a deny", () => {
    const result = extractAbortCode({ effects: { status: { status: "success" } } });
    assert.equal(result.outcome, "success");
    assert.equal(classifyNegative({ effects: { status: { status: "success" } } }), "security-fail");
});

test("unrelated abort is misconfiguration, not a healthy deny", () => {
    const result = extractAbortCode(inspectFailure("MoveAbort(MoveLocation { module: foo }, 1) in command 0"));
    assert.equal(result.outcome, "abort");
    assert.equal(result.code, 1);
    assert.equal(classifyNegative(inspectFailure("MoveAbort(MoveLocation { module: foo }, 1) in command 0")), "misconfig");
});

test("skips with exit 0 when required secrets are unset", () => {
    const result = spawnScript();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /skip \(required env vars unset/);
});

test("partial secrets exit 2 as misconfiguration", () => {
    const result = spawnScript({
        SEAL_CROSS_ACCOUNT_A_ID: `0x${"aa".repeat(32)}`,
        SEAL_CROSS_ACCOUNT_B_ID: `0x${"bb".repeat(32)}`,
        SEAL_CROSS_ACCOUNT_A_KEY: "aa".repeat(32),
    });
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, /partial secrets/);
});
