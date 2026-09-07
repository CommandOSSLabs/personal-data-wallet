import assert from "node:assert/strict";
import test from "node:test";

import { helpText, parseArgs } from "../dist/index.js";

// WALM-390: an unrecognised flag used to fall through parseArgs' default
// branch and vanish. A typo'd `--namesapce` still wrote to the relayer's
// "default" namespace with nothing on stderr to explain why. parseArgs now
// collects what it did not understand so main() can name it.

test("parseArgs collects a typo'd flag instead of dropping it", () => {
    const args = parseArgs(["--namesapce", "work"]);
    assert.deepEqual(args.unknown, ["--namesapce"]);
    // The typo must NOT have set the real namespace.
    assert.equal(args.namespace, undefined);
});

test("parseArgs reports every unknown flag, not just the first", () => {
    const args = parseArgs(["--nope", "--alsobad"]);
    assert.deepEqual(args.unknown, ["--nope", "--alsobad"]);
});

test("an unknown flag swallows its value rather than reporting it too", () => {
    // Warning once about `--namesapce` beats warning twice, the second time
    // naming the user's data. Also keeps a mistyped secret out of the logs.
    assert.deepEqual(parseArgs(["--tokenn", "hunter2"]).unknown, ["--tokenn"]);
});

test("an unknown flag does not swallow the flag that follows it", () => {
    const args = parseArgs(["--typo", "--prod"]);
    assert.deepEqual(args.unknown, ["--typo"]);
    assert.equal(args.relayerUrl, "https://relayer.memory.walrus.xyz");
});

test("a known flag after an unknown flag's value still applies", () => {
    const args = parseArgs(["--typo", "value", "--ns", "work"]);
    assert.deepEqual(args.unknown, ["--typo"]);
    assert.equal(args.namespace, "work");
});

test("parseArgs treats no known flag as unknown", () => {
    const known = [
        "--help", "-h",
        "--logout",
        "--login", "login",
        "--prod", "--dev", "--staging", "--local",
        "--relayer", "https://r.example",
        "--relayer-url", "https://r.example",
        "--web-url", "https://w.example",
        "--web", "https://w.example",
        "--label", "my label",
        "--namespace", "ns",
        "--ns", "ns",
        "--relayer=https://r.example",
        "--web-url=https://w.example",
        "--label=my-label",
        "--namespace=ns",
        "--ns=ns",
    ];
    assert.deepEqual(parseArgs(known).unknown, []);
});

test("parseArgs does not mistake a flag's value for an unknown flag", () => {
    // `next()` consumes the value, so "MCP Client" must never be reported.
    const args = parseArgs(["--label", "MCP Client"]);
    assert.deepEqual(args.unknown, []);
    assert.equal(args.label, "MCP Client");
});

test("env presets still resolve both URLs (regression guard)", () => {
    const args = parseArgs(["--prod"]);
    assert.equal(args.relayerUrl, "https://relayer.memory.walrus.xyz");
    assert.equal(args.webUrl, "https://memory.walrus.xyz");
    assert.deepEqual(args.unknown, []);
});

// WALM-390 item 2: `--prod` read as unsupported to anyone checking --help,
// which is how the bug got reported. Help must list every preset the parser
// honours — and stay listing them as presets are added.

test("--help documents every network preset the parser accepts", () => {
    const help = helpText();
    for (const preset of ["--prod", "--dev", "--staging", "--local"]) {
        // Not merely mentioned somewhere — parseArgs must accept it too.
        assert.deepEqual(parseArgs([preset]).unknown, [], `${preset} not accepted`);
        assert.ok(help.includes(preset), `${preset} missing from --help`);
    }
    // The URLs a preset resolves to are what tell you which network you're on.
    assert.ok(help.includes("https://relayer.dev.memwal.ai"));
    assert.ok(help.includes("http://127.0.0.1:8000"));
});
