/**
 * WALM-602 / GH #365 — an expired session must be distinguishable from an
 * empty namespace.
 *
 * The original report was "recall silently returns empty instead of an auth
 * error". The server half of that closed in 0.0.11 (`45b0ad87` made the MCP
 * proxy require a registered delegate, so an unregistered key no longer opens
 * a session that then honestly reports zero rows). What remains is the client
 * half: a relayer that rejects the credentials 401s the SSE handshake, and the
 * bridge's background connect treats that like any other connect failure —
 * exponential-backoff retry — so the queued tool call waits out the orphan
 * sweeper instead of being told the credentials were rejected.
 *
 * These two tests pin the distinction the ticket asks for:
 *   - rejected credentials  -> an auth error naming the way back in
 *   - valid creds, no hits  -> an ordinary empty result, NOT an error
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, "../dist/bin/memwal-mcp.js");
const BEARER = "a".repeat(64);
const ACCOUNT = "0x" + "3".repeat(64);

/** Bound the whole exchange. Long enough for a couple of reconnect backoffs,
 * short enough that a hang fails the test instead of stalling the suite. */
const CALL_TIMEOUT_MS = 4000;

function serveVersion(res) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
        JSON.stringify({
            apiVersion: "1.0.0",
            relayerVersion: "1.0.0",
            minSupportedSdk: { mcp: "0.0.1" },
        }),
    );
}

/**
 * Relayer that rejects the delegate key on the SSE handshake — what the proxy
 * now does for a revoked or never-registered delegate.
 */
function startRejectingRelayer() {
    let sseAttempts = 0;
    const server = http.createServer((req, res) => {
        const url = new URL(req.url, "http://127.0.0.1");
        if (req.method === "GET" && url.pathname === "/version") {
            serveVersion(res);
            return;
        }
        if (req.method === "GET" && url.pathname === "/api/mcp/sse") {
            sseAttempts += 1;
            res.writeHead(401, { "content-type": "application/json" });
            res.end(JSON.stringify({ error: "delegate key is not registered" }));
            return;
        }
        res.writeHead(404);
        res.end();
    });
    return new Promise((ready) => {
        server.listen(0, "127.0.0.1", () => {
            const { port } = server.address();
            ready({
                server,
                base: `http://127.0.0.1:${port}`,
                sseAttempts: () => sseAttempts,
            });
        });
    });
}

/**
 * Healthy relayer whose namespace simply holds nothing — the contrast case.
 * Mirrors the sidecar's own wording for a genuinely empty namespace.
 */
function startEmptyNamespaceRelayer() {
    let sseRes = null;
    const server = http.createServer((req, res) => {
        const url = new URL(req.url, "http://127.0.0.1");
        if (req.method === "GET" && url.pathname === "/version") {
            serveVersion(res);
            return;
        }
        if (req.method === "GET" && url.pathname === "/api/mcp/sse") {
            res.writeHead(200, {
                "content-type": "text/event-stream",
                "cache-control": "no-cache",
                connection: "keep-alive",
            });
            res.write("event: endpoint\ndata: /api/mcp/messages?sessionId=test\n\n");
            sseRes = res;
            return;
        }
        if (req.method === "POST" && url.pathname === "/api/mcp/messages") {
            let body = "";
            req.on("data", (c) => (body += c));
            req.on("end", () => {
                res.writeHead(202);
                res.end();
                let msg;
                try {
                    msg = JSON.parse(body);
                } catch {
                    return;
                }
                if (msg.method === "tools/call") {
                    sseRes?.write(
                        `event: message\ndata: ${JSON.stringify({
                            jsonrpc: "2.0",
                            id: msg.id,
                            result: {
                                content: [{ type: "text", text: "No matching memories found." }],
                                isError: false,
                            },
                        })}\n\n`,
                    );
                }
            });
            return;
        }
        res.writeHead(404);
        res.end();
    });
    return new Promise((ready) => {
        server.listen(0, "127.0.0.1", () => {
            const { port } = server.address();
            ready({ server, base: `http://127.0.0.1:${port}` });
        });
    });
}

/** Spawn the bridge against `base` with credentials on disk, wired for stdio. */
function startBridge(base) {
    const home = mkdtempSync(join(tmpdir(), "memwal-test-"));
    mkdirSync(join(home, ".memwal"));
    writeFileSync(
        join(home, ".memwal", "credentials.json"),
        JSON.stringify({
            delegatePrivateKey: BEARER,
            delegatePublicKeyHex: "b".repeat(64),
            delegateAddress: "0x" + "1".repeat(64),
            walletAddress: "0x" + "2".repeat(64),
            accountId: ACCOUNT,
            packageId: "0x" + "4".repeat(64),
            relayerUrl: base,
            label: "test",
            createdAt: new Date(0).toISOString(),
            version: 1,
        }),
    );

    const child = spawn(process.execPath, [BIN, "--relayer", base, "--web-url", base], {
        env: {
            ...process.env,
            HOME: home,
            USERPROFILE: home,
            MEMWAL_MCP_CALL_TIMEOUT_MS: String(CALL_TIMEOUT_MS),
        },
        stdio: ["pipe", "pipe", "pipe"],
    });

    const received = [];
    const listeners = new Set();
    let buf = "";
    child.stdout.on("data", (d) => {
        buf += d.toString();
        let nl;
        while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl);
            buf = buf.slice(nl + 1);
            if (!line.trim()) continue;
            let msg;
            try {
                msg = JSON.parse(line);
            } catch {
                continue;
            }
            received.push(msg);
            for (const l of [...listeners]) l(msg);
        }
    });

    const send = (obj) => child.stdin.write(JSON.stringify(obj) + "\n");
    const waitFor = (pred, ms) => {
        const hit = received.find(pred);
        if (hit) return Promise.resolve(hit);
        return new Promise((res, rej) => {
            const timer = setTimeout(() => {
                listeners.delete(l);
                rej(new Error("timed out waiting for message"));
            }, ms);
            const l = (m) => {
                if (pred(m)) {
                    clearTimeout(timer);
                    listeners.delete(l);
                    res(m);
                }
            };
            listeners.add(l);
        });
    };

    return {
        send,
        waitFor,
        cleanup: () => {
            child.kill("SIGKILL");
            rmSync(home, { recursive: true, force: true });
        },
    };
}

function textOf(msg) {
    const content = msg?.result?.content;
    if (!Array.isArray(content)) return "";
    return content.map((c) => c?.text ?? "").join("\n");
}

test("recall on rejected credentials reports an auth error, not empty results", async (t) => {
    const { server, base } = await startRejectingRelayer();
    const bridge = startBridge(base);
    t.after(() => {
        bridge.cleanup();
        server.close();
    });

    bridge.send({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test", version: "0" },
        },
    });
    await bridge.waitFor((m) => m.id === 1 && m.result, 15000);

    bridge.send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "memwal_recall", arguments: { query: "anything", limit: 5 } },
    });

    // Generous relative to CALL_TIMEOUT_MS so a slow machine doesn't flake, but
    // far below the 240s production default: the point is that the answer comes
    // from the 401, not from waiting out the orphan sweeper.
    const reply = await bridge.waitFor((m) => m.id === 2 && (m.result || m.error), 20000);
    const text = `${textOf(reply)} ${reply?.error?.message ?? ""}`.toLowerCase();

    assert.ok(
        reply.error || reply.result?.isError,
        `recall against rejected credentials must be an error, got: ${JSON.stringify(reply)}`,
    );
    assert.ok(
        !text.includes("no matching memories"),
        "rejected credentials must not read as an empty namespace",
    );
    assert.ok(
        /401|credential|unauthorized|signed out|memwal_login/.test(text),
        `error must name the auth failure and the way back in, got: ${text}`,
    );
});

test("recall on an empty namespace reports empty results, not an auth error", async (t) => {
    const { server, base } = await startEmptyNamespaceRelayer();
    const bridge = startBridge(base);
    t.after(() => {
        bridge.cleanup();
        server.close();
    });

    bridge.send({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test", version: "0" },
        },
    });
    await bridge.waitFor((m) => m.id === 1 && m.result, 15000);

    bridge.send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "memwal_recall", arguments: { query: "anything", limit: 5 } },
    });

    const reply = await bridge.waitFor((m) => m.id === 2 && (m.result || m.error), 20000);
    const text = textOf(reply);

    assert.equal(reply.error, undefined, `empty namespace must not error: ${JSON.stringify(reply)}`);
    assert.notEqual(reply.result?.isError, true, "empty namespace must not be an error result");
    assert.match(text, /no matching memories/i);
    assert.ok(
        !/401|unauthorized|signed out/i.test(text),
        `empty namespace must not read as an auth failure, got: ${text}`,
    );
});
