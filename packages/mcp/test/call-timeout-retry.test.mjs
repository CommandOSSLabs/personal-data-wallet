/**
 * Retry + structured failure for a stalled tool call (bridge.ts).
 *
 * Bug being guarded against (WALM-393): a `memwal_recall` that stalled after a
 * successful sign-in got no retry, no backoff, and an opaque raw timeout. The
 * per-call deadline from WALM-328 stopped the hang, but it answered on the
 * FIRST expiry with prose only — so a transient stall was never re-driven, and
 * an agent could not tell an overloaded relayer from a dead network or a
 * misconfigured bridge without reading the sentence.
 *
 * Every case here keeps `MEMWAL_MCP_SSE_IDLE_MS` far above the call deadline
 * and heartbeats the stream throughout. That is what proves these assertions
 * exercise the call deadline and not the idle watchdog: on a heartbeating
 * stream the watchdog can never fire, which is the whole reason the per-call
 * path exists.
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
const EXPECTED_BEARER = "a".repeat(64);
const EXPECTED_ACCOUNT_ID = "0x" + "3".repeat(64);

function hasBridgeAuth(req) {
    return (
        req.headers.authorization === `Bearer ${EXPECTED_BEARER}` &&
        req.headers["x-memwal-account-id"] === EXPECTED_ACCOUNT_ID
    );
}

/**
 * Mock relayer whose SSE session stays healthy (and heartbeating) throughout.
 * `onToolCall(msg, session, seenForTool)` decides what happens to each
 * `tools/call`: return `"answer"` to reply normally, `"swallow"` to accept the
 * POST and never respond, `"destroy"` to kill the POST socket, or `"hold"` to
 * leave the POST itself unanswered for `holdMs` — which backs up the bridge's
 * one-POST-at-a-time chain behind it.
 */
function startMockRelayer({ onToolCall, sseGetDelayMs = () => 0, holdMs = 4000 }) {
    const sessions = new Map();
    /** Live SSE responses, newest last, so a test can end one and make the
     * bridge's server pump reconnect exactly the way a dropped stream would —
     * no call timeout required to get a reconnect in flight. */
    const streams = [];
    let sseGetCount = 0;
    let sseEstablishedCount = 0;
    /** Waiters on a handshake milestone. "received" fires when the GET arrives,
     * "established" when the endpoint event has been written; `sseGetDelayMs`
     * is what pulls those two moments apart. */
    const sseWaiters = [];
    function noteSse(kind) {
        for (const w of [...sseWaiters]) {
            const seen = kind === "received" ? sseGetCount : sseEstablishedCount;
            if (w.kind === kind && seen >= w.count) {
                sseWaiters.splice(sseWaiters.indexOf(w), 1);
                w.resolve();
            }
        }
    }
    function waitForSse(kind, count, ms) {
        const seen = () => (kind === "received" ? sseGetCount : sseEstablishedCount);
        if (seen() >= count) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const w = { kind, count, resolve: () => {} };
            const timer = setTimeout(() => {
                const i = sseWaiters.indexOf(w);
                if (i >= 0) sseWaiters.splice(i, 1);
                reject(new Error(`timed out waiting for SSE ${kind} #${count}; saw ${seen()}`));
            }, ms);
            w.resolve = () => {
                clearTimeout(timer);
                resolve();
            };
            sseWaiters.push(w);
        });
    }
    /** POSTs seen per tool name, so a test can prove a replay happened — or
     * prove one did NOT, which is the point for writes. */
    const toolPostCounts = new Map();
    /** Resolvers waiting on a POST count, so tests can synchronise on what the
     * bridge actually did rather than on elapsed wall-clock. */
    const postWaiters = [];
    function notePost(tool) {
        const seen = (toolPostCounts.get(tool) ?? 0) + 1;
        toolPostCounts.set(tool, seen);
        for (const w of [...postWaiters]) {
            if (w.tool === tool && seen >= w.count) {
                postWaiters.splice(postWaiters.indexOf(w), 1);
                w.resolve();
            }
        }
        return seen;
    }
    const server = http.createServer((req, res) => {
        const url = new URL(req.url, "http://127.0.0.1");
        if (req.method === "GET" && url.pathname === "/version") {
            res.writeHead(200, { "content-type": "application/json" });
            res.end(
                JSON.stringify({
                    apiVersion: "1.0.0",
                    relayerVersion: "1.0.0",
                    minSupportedSdk: { mcp: "0.0.1" },
                }),
            );
            return;
        }
        if (req.method === "GET" && url.pathname === "/api/mcp/sse") {
            if (!hasBridgeAuth(req)) {
                res.writeHead(401);
                res.end();
                return;
            }
            sseGetCount += 1;
            const nth = sseGetCount;
            noteSse("received");
            const sessionId = `session-${nth}`;
            // A handshake can be slow without being dead. Stalling one here is
            // how a test makes a reconnect outlast the per-call deadline that
            // reconnect is supposed to be rescuing — the WALM-393 hazard.
            const open = () => {
                if (res.writableEnded) return;
                res.writeHead(200, {
                    "content-type": "text/event-stream",
                    "cache-control": "no-cache",
                    connection: "keep-alive",
                });
                res.write(`event: endpoint\ndata: /api/mcp/messages?sessionId=${sessionId}\n\n`);
                sessions.set(sessionId, { res });
                streams.push(res);
                sseEstablishedCount += 1;
                noteSse("established");
                // Far faster than MEMWAL_MCP_SSE_IDLE_MS: the stream must always
                // look alive, so the watchdog is never what rescues these calls.
                const hb = setInterval(() => {
                    if (res.writableEnded) {
                        clearInterval(hb);
                        return;
                    }
                    res.write(":keepalive\n\n");
                }, 200);
                hb.unref?.();
                res.on("close", () => clearInterval(hb));
            };
            const delayMs = sseGetDelayMs(nth);
            if (delayMs > 0) {
                const timer = setTimeout(open, delayMs);
                timer.unref?.();
            } else {
                open();
            }
            return;
        }
        if (req.method === "POST" && url.pathname === "/api/mcp/messages") {
            if (!hasBridgeAuth(req)) {
                res.writeHead(401);
                res.end();
                return;
            }
            const sessionId = url.searchParams.get("sessionId");
            const session = sessions.get(sessionId);
            let body = "";
            req.on("data", (c) => (body += c));
            req.on("end", () => {
                let msg;
                try {
                    msg = JSON.parse(body);
                } catch {
                    res.writeHead(202);
                    res.end();
                    return;
                }
                // Counted BEFORE the session lookup: a POST aimed at a session
                // we no longer recognise still LEFT the bridge, and "did the
                // bridge send this?" is what the duplicate-write assertions
                // turn on.
                if (msg.method === "tools/call") notePost(msg.params?.name ?? "");
                if (!session) {
                    res.writeHead(404);
                    res.end();
                    return;
                }
                if (msg.method === "initialize") {
                    res.writeHead(202);
                    res.end();
                    session.res.write(
                        `event: message\ndata: ${JSON.stringify({
                            jsonrpc: "2.0",
                            id: msg.id,
                            result: {
                                protocolVersion: "2024-11-05",
                                capabilities: { tools: { listChanged: true } },
                                serverInfo: { name: "memwal", version: "0.0.1" },
                            },
                        })}\n\n`,
                    );
                    return;
                }
                if (msg.method !== "tools/call") {
                    res.writeHead(202);
                    res.end();
                    return;
                }
                const tool = msg.params?.name ?? "";
                const seen = toolPostCounts.get(tool) ?? 0;
                const action = onToolCall(msg, session, seen);
                if (action === "destroy") {
                    // Transport-level failure: the POST never completes.
                    req.socket.destroy();
                    return;
                }
                if (action === "hold") {
                    // The POST request itself does not complete, so every
                    // later POST sits in the bridge's `postChain` behind it.
                    const timer = setTimeout(() => {
                        res.writeHead(202);
                        res.end();
                    }, holdMs);
                    timer.unref?.();
                    return;
                }
                if (action === "429") {
                    res.writeHead(429, { "content-type": "text/plain" });
                    res.end("slow down");
                    return;
                }
                res.writeHead(202);
                res.end();
                if (action === "swallow") return; // accepted, never answered
                session.res.write(
                    `event: message\ndata: ${JSON.stringify({
                        jsonrpc: "2.0",
                        id: msg.id,
                        result: {
                            content: [{ type: "text", text: "RECALL_OK" }],
                            isError: false,
                        },
                    })}\n\n`,
                );
            });
            return;
        }
        res.writeHead(404);
        res.end();
    });
    return new Promise((res) => {
        server.listen(0, "127.0.0.1", () => {
            const { port } = server.address();
            res({
                server,
                base: `http://127.0.0.1:${port}`,
                getSseGetCount: () => sseGetCount,
                waitForSseGet: (count, ms = 15000) => waitForSse("received", count, ms),
                waitForSseEstablished: (count, ms = 15000) =>
                    waitForSse("established", count, ms),
                /** End the newest SSE response. The bridge's server pump reads
                 * that as EOF and starts a reconnect, which is the trigger a
                 * genuinely dropped stream produces. */
                killLatestStream: () => {
                    const res = streams[streams.length - 1];
                    if (res && !res.writableEnded) res.end();
                },
                getToolPostCount: (tool) => toolPostCounts.get(tool) ?? 0,
                waitForToolPost: (tool, count, ms = 15000) =>
                    new Promise((resolve, reject) => {
                        if ((toolPostCounts.get(tool) ?? 0) >= count) return resolve();
                        const w = { tool, count, resolve: () => {} };
                        const timer = setTimeout(() => {
                            const i = postWaiters.indexOf(w);
                            if (i >= 0) postWaiters.splice(i, 1);
                            reject(
                                new Error(
                                    `timed out waiting for ${count} POST(s) of ${tool}; saw ${
                                        toolPostCounts.get(tool) ?? 0
                                    }`,
                                ),
                            );
                        }, ms);
                        w.resolve = () => {
                            clearTimeout(timer);
                            resolve();
                        };
                        postWaiters.push(w);
                    }),
            });
        });
    });
}

function makeCreds(relayerUrl) {
    return {
        delegatePrivateKey: EXPECTED_BEARER,
        delegatePublicKeyHex: "b".repeat(64),
        delegateAddress: "0x" + "1".repeat(64),
        walletAddress: "0x" + "2".repeat(64),
        accountId: EXPECTED_ACCOUNT_ID,
        packageId: "0x" + "4".repeat(64),
        relayerUrl,
        label: "Call Timeout Test",
        createdAt: new Date(0).toISOString(),
        version: 1,
    };
}

/** Boot the bridge against `mock` and return helpers for driving it. */
function startBridge(t, mock, env = {}) {
    const home = mkdtempSync(join(tmpdir(), "memwal-call-timeout-test-"));
    const credsFile = join(home, ".memwal", "credentials.json");
    mkdirSync(dirname(credsFile), { recursive: true });
    writeFileSync(credsFile, JSON.stringify(makeCreds(mock.base)), { mode: 0o600 });

    const child = spawn(process.execPath, [BIN, "--relayer", mock.base, "--web-url", mock.base], {
        env: {
            ...process.env,
            HOME: home,
            USERPROFILE: home,
            // Well above the call deadline: the stream is never judged idle.
            MEMWAL_MCP_SSE_IDLE_MS: "60000",
            MEMWAL_MCP_CALL_TIMEOUT_MS: "1500",
            MEMWAL_MCP_CALL_RETRIES: "1",
            ...env,
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
    let stderrBuf = "";
    child.stderr.on("data", (d) => (stderrBuf += d.toString()));

    t.after(() => {
        child.kill("SIGKILL");
        mock.server.close();
        rmSync(home, { recursive: true, force: true });
    });

    const send = (obj) => child.stdin.write(JSON.stringify(obj) + "\n");
    const waitFor = (pred, ms = 20000) => {
        const hit = received.find(pred);
        if (hit) return Promise.resolve(hit);
        return new Promise((res, rej) => {
            const timer = setTimeout(() => {
                listeners.delete(l);
                rej(
                    new Error(
                        `timed out waiting for message\n--- stderr ---\n${stderrBuf}\n--- received ---\n${received
                            .map((m) => JSON.stringify(m))
                            .join("\n")}`,
                    ),
                );
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
    /** Resolve once the relayer session is live AND the pre-connect buffer has
     * drained — the bridge emits `notifications/tools/list_changed` at exactly
     * that point. Tool calls sent before this take the buffered-flush path
     * instead of the direct forward path, and the ticket is about a call that
     * stalled AFTER a successful sign-in. */
    const waitForConnected = () =>
        waitFor((m) => m.method === "notifications/tools/list_changed", 10_000);

    return { send, waitFor, waitForConnected, received, stderr: () => stderrBuf };
}

test("a stalled recall is retried and succeeds on the replay", async (t) => {
    // First recall POST is accepted and never answered; the replay is answered.
    const mock = await startMockRelayer({
        onToolCall: (_msg, _session, seen) => (seen === 1 ? "swallow" : "answer"),
    });
    const bridge = startBridge(t, mock);

    bridge.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await bridge.waitFor((m) => m.id === 1 && m.result, 10_000);
    await bridge.waitForConnected();

    bridge.send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "memwal_recall", arguments: { query: "stall me" } },
    });

    const reply = await bridge.waitFor((m) => m.id === 2);
    assert.equal(
        reply.result?.isError,
        false,
        `expected the retry to succeed, got ${JSON.stringify(reply)}`,
    );
    assert.match(JSON.stringify(reply.result), /RECALL_OK/);
    // Proves the success came from a REPLAY and not from the first POST.
    assert.ok(
        mock.getToolPostCount("memwal_recall") >= 2,
        `expected the recall to be re-posted, saw ${mock.getToolPostCount("memwal_recall")} POST(s)`,
    );
});

test("a recall that never answers ends in a structured, classified error", async (t) => {
    const mock = await startMockRelayer({ onToolCall: () => "swallow" });
    const bridge = startBridge(t, mock);

    bridge.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await bridge.waitFor((m) => m.id === 1 && m.result, 10_000);
    await bridge.waitForConnected();

    const startedAt = Date.now();
    bridge.send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "memwal_recall", arguments: { query: "never answered" } },
    });

    const reply = await bridge.waitFor((m) => m.id === 2);
    const elapsed = Date.now() - startedAt;
    assert.equal(reply.result?.isError, true, "expected a tool-result error envelope");

    const structured = reply.result?.structuredContent;
    assert.ok(structured, `expected structuredContent, got ${JSON.stringify(reply.result)}`);
    assert.equal(structured.code, "MEMWAL_CALL_TIMEOUT");
    // The stream kept heartbeating and the POST was accepted, so the transport
    // was fine — blaming the network here would send debugging the wrong way.
    assert.equal(structured.class, "relayer_overload");
    assert.equal(structured.tool, "memwal_recall");
    // 1 retry configured => the original send plus one replay.
    assert.equal(structured.attempts, 2);
    assert.equal(structured.timeoutMs, 1500);
    assert.equal(structured.retryable, true);
    assert.ok(structured.nextStep.length > 0, "an agent needs something to do next");

    // The whole point is to speak before the host's own ~60s tool timeout.
    assert.ok(elapsed < 30_000, `structured error took ${elapsed}ms — too slow to beat the host`);

    // The prose has to carry the same verdict for hosts that drop
    // structuredContent, and must not claim the relayer was unreachable.
    const text = JSON.stringify(reply.result.content);
    assert.match(text, /timed out/i);
    assert.match(text, /relayer_overload/);
    assert.doesNotMatch(text, /relayer unavailable/i);
});

test("a stalled write is not retried, but still gets the structured error", async (t) => {
    const mock = await startMockRelayer({ onToolCall: () => "swallow" });
    const bridge = startBridge(t, mock);

    bridge.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await bridge.waitFor((m) => m.id === 1 && m.result, 10_000);
    await bridge.waitForConnected();

    bridge.send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "memwal_remember", arguments: { text: "do not duplicate me" } },
    });

    const reply = await bridge.waitFor((m) => m.id === 2);
    assert.equal(reply.result?.isError, true);
    const structured = reply.result?.structuredContent;
    assert.ok(structured, "a write deserves the same machine-readable answer");
    assert.equal(structured.tool, "memwal_remember");
    // The relayer accepted the POST, so the write may already have landed.
    // Replaying it would write twice — one attempt, and one only.
    assert.equal(structured.attempts, 1);
    assert.equal(
        mock.getToolPostCount("memwal_remember"),
        1,
        "a write must never be re-posted by the timeout retry",
    );
});

test("a write that may already have landed is not advertised as safe to repeat", async (t) => {
    // The bridge refuses to replay a timed-out write itself, because the POST
    // was accepted and the relayer may already have applied it. The answer it
    // hands back has to say the same thing. `retryable: true` plus "retry the
    // same call" would move the duplicate one level up: the agent re-issues it
    // and an append-only store gains a second copy of the memory — the exact
    // outcome the reconnect-replay and already-answered guards exist to stop.
    const mock = await startMockRelayer({ onToolCall: () => "swallow" });
    const bridge = startBridge(t, mock, { MEMWAL_MCP_CALL_TIMEOUT_MS: "1500" });

    bridge.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await bridge.waitFor((m) => m.id === 1 && m.result, 10_000);
    await bridge.waitForConnected();

    bridge.send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "memwal_remember", arguments: { text: "may already have landed" } },
    });

    const reply = await bridge.waitFor((m) => m.id === 2, 20_000);
    const structured = reply.result?.structuredContent;
    assert.ok(structured, `expected structuredContent, got ${JSON.stringify(reply.result)}`);
    // Precondition: the POST really did go out, which is what makes the write
    // unsafe to repeat. Without this the assertion below could pass vacuously.
    assert.equal(structured.attempts, 1);
    assert.equal(mock.getToolPostCount("memwal_remember"), 1);

    assert.equal(
        structured.retryable,
        false,
        "a sent write is not safe to re-drive blindly",
    );
    assert.doesNotMatch(
        structured.nextStep,
        /retry the same call/i,
        `told the agent to repeat a write that may have landed: ${structured.nextStep}`,
    );
    assert.match(structured.nextStep, /may already have been applied/);
    // The prose has to agree with the payload: the relayer took this POST, so
    // the bridge is not entitled to say the write did not happen.
    assert.doesNotMatch(
        reply.result.content[0].text,
        /did not complete|did not run/,
        `denied a write the relayer accepted: ${reply.result.content[0].text}`,
    );

    // A read in the same situation keeps the plain retry advice — the
    // narrowing must be about write safety, not a blanket downgrade.
    bridge.send({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "memwal_recall", arguments: { query: "still retryable" } },
    });
    const readReply = await bridge.waitFor((m) => m.id === 3, 30_000);
    assert.equal(readReply.result?.structuredContent?.retryable, true);
});

test("a read timing out does not drag a concurrent write into the replay", async (t) => {
    // The retry works by reconnecting, and a reconnect replays every in-flight
    // request. That is correct when the stream died and the POSTs were lost,
    // but a call-timeout reconnect fires while the stream is HEALTHY and the
    // relayer already accepted the write — replaying it there can store the
    // memory twice.
    //
    // The window this needs is narrow, so nothing here sleeps its way into it:
    // each step waits for the POST the bridge actually made. The write has to
    // be in flight, and NOT yet expired, at the moment the read is replayed —
    // hence the longer deadline, which buys margin on both sides of that
    // moment without making the test slow.
    const CALL_TIMEOUT_MS = 2500;
    const mock = await startMockRelayer({ onToolCall: () => "swallow" });
    const bridge = startBridge(t, mock, {
        MEMWAL_MCP_CALL_TIMEOUT_MS: String(CALL_TIMEOUT_MS),
        MEMWAL_MCP_CALL_RETRIES: "1",
    });

    bridge.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await bridge.waitFor((m) => m.id === 1 && m.result, 10_000);
    await bridge.waitForConnected();

    // Read first, so its deadline is the one that expires and reconnects.
    bridge.send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "memwal_recall", arguments: { query: "stall me" } },
    });
    await mock.waitForToolPost("memwal_recall", 1);

    // Start the write partway through the read's deadline: late enough that it
    // is still in flight when the read is replayed, early enough that it has
    // certainly been registered by then. Waiting on its POST is what makes
    // "registered" a fact rather than an assumption.
    await new Promise((r) => setTimeout(r, CALL_TIMEOUT_MS / 2));
    bridge.send({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "memwal_remember", arguments: { text: "must land once" } },
    });
    await mock.waitForToolPost("memwal_remember", 1);

    // The read's replay — the exact moment the bug would re-send the write.
    await mock.waitForToolPost("memwal_recall", 2);

    // Let the reconnect settle, including the server-pump EOF that tearing the
    // stream down triggers: that is a SECOND reconnect, and it replays too.
    await bridge.waitFor((m) => m.id === 3 && m.result?.isError === true, 25_000);

    assert.equal(
        mock.getToolPostCount("memwal_remember"),
        1,
        "the read's reconnect replayed the write — that duplicates the memory",
    );
});

test("a POST that fails at the transport is reported as a send failure, not a parse error", async (t) => {
    const mock = await startMockRelayer({ onToolCall: () => "destroy" });
    const bridge = startBridge(t, mock);

    bridge.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await bridge.waitFor((m) => m.id === 1 && m.result, 10_000);
    await bridge.waitForConnected();

    bridge.send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "memwal_recall", arguments: { query: "socket dies" } },
    });

    const reply = await bridge.waitFor((m) => m.id === 2);
    assert.equal(reply.result?.isError, true);
    assert.equal(reply.result?.structuredContent?.class, "transient_network");

    const stderr = bridge.stderr();
    assert.match(stderr, /bridge\.forward_failed/, "the transport failure must be named as one");
    // The exact misattribution this fixes: a dead socket logged as bad client
    // input, which sends anyone reading the logs after the wrong bug.
    assert.doesNotMatch(
        stderr,
        /bridge\.stdin_parse_failed/,
        "a failed POST is not unparseable client input",
    );
});

test("a 429 on the message POST is classified as relayer overload", async (t) => {
    const mock = await startMockRelayer({ onToolCall: () => "429" });
    const bridge = startBridge(t, mock);

    bridge.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await bridge.waitFor((m) => m.id === 1 && m.result, 10_000);
    await bridge.waitForConnected();

    bridge.send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "memwal_recall", arguments: { query: "rate limited" } },
    });

    const reply = await bridge.waitFor((m) => m.id === 2);
    assert.equal(reply.result?.isError, true);
    const structured = reply.result?.structuredContent;
    assert.ok(structured, "expected structuredContent");
    assert.equal(structured.class, "relayer_overload");
    assert.equal(structured.retryable, true);
});

test("a retry still reaches the relayer when the reconnect outlasts the call deadline", async (t) => {
    // The retry rides `reconnect()`, which can spend backoff plus a whole
    // handshake before any POST goes out. Spending the retry's budget at the
    // moment we DECIDE to retry — rather than when the replay is actually
    // sent — means that budget can expire mid-reconnect, and the call is then
    // closed out as exhausted while the replay that would have answered it is
    // still in flight. The retry silently never happens, and the error claims
    // it did. A deadline of 1500ms against a 3s handshake is not exotic: this
    // package's own troubleshooting guide tells operators to set
    // MEMWAL_MCP_CALL_TIMEOUT_MS well below the ~25s a reconnect can take.
    const CALL_TIMEOUT_MS = 1500;
    const mock = await startMockRelayer({
        onToolCall: (_msg, _session, seen) => (seen === 1 ? "swallow" : "answer"),
        sseGetDelayMs: (n) => (n === 2 ? 3000 : 0),
    });
    const bridge = startBridge(t, mock, {
        MEMWAL_MCP_CALL_TIMEOUT_MS: String(CALL_TIMEOUT_MS),
        MEMWAL_MCP_CALL_RETRIES: "1",
    });

    bridge.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await bridge.waitFor((m) => m.id === 1 && m.result, 10_000);
    await bridge.waitForConnected();

    bridge.send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "memwal_recall", arguments: { query: "stall me" } },
    });

    const reply = await bridge.waitFor((m) => m.id === 2, 30_000);
    assert.equal(
        reply.result?.isError,
        false,
        `the replay should have answered this call, got ${JSON.stringify(reply.result)}`,
    );
    assert.match(JSON.stringify(reply.result), /RECALL_OK/);
    assert.equal(
        mock.getToolPostCount("memwal_recall"),
        2,
        "the configured retry must actually reach the relayer, not just be counted",
    );
});

test("the reported attempt count never exceeds the POSTs that actually went out", async (t) => {
    // `attempts` is the diagnostic this ticket exists to add, so it has to
    // count sends, not intentions. The same slow reconnect as above is what
    // pulls the two apart: a retry decided at t+1500 but posted at t+5000.
    const CALL_TIMEOUT_MS = 1500;
    const mock = await startMockRelayer({
        onToolCall: () => "swallow",
        sseGetDelayMs: (n) => (n === 2 ? 3000 : 0),
    });
    const bridge = startBridge(t, mock, {
        MEMWAL_MCP_CALL_TIMEOUT_MS: String(CALL_TIMEOUT_MS),
        MEMWAL_MCP_CALL_RETRIES: "1",
    });

    bridge.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await bridge.waitFor((m) => m.id === 1 && m.result, 10_000);
    await bridge.waitForConnected();

    bridge.send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "memwal_recall", arguments: { query: "never answered" } },
    });

    const reply = await bridge.waitFor((m) => m.id === 2, 30_000);
    assert.equal(reply.result?.isError, true);
    const structured = reply.result?.structuredContent;
    assert.ok(structured, `expected structuredContent, got ${JSON.stringify(reply.result)}`);
    const posts = mock.getToolPostCount("memwal_recall");
    assert.ok(
        structured.attempts <= posts,
        `claimed ${structured.attempts} attempt(s) but only ${posts} POST(s) reached the relayer`,
    );
    // The prose repeats the number, so it inherits the same obligation.
    assert.match(
        JSON.stringify(reply.result.content),
        new RegExp(`after ${structured.attempts} attempt`),
    );
});

test("a call already answered with a timeout error is never sent to the relayer afterwards", async (t) => {
    // A request that arrives during a reconnect parks on it before posting.
    // While parked it is visible in the in-flight map, so the sweeper can
    // answer it — and the parked forward would then resume and POST it anyway.
    // For `memwal_remember` that is a write reported as failed that still
    // lands, and an agent following the error's own advice stores it twice.
    //
    // Retries are OFF here on purpose: the hazard is the reconnect path, not
    // the retry that happens to use it, so nothing about the fix for the retry
    // accounting can make this pass by accident.
    const CALL_TIMEOUT_MS = 1200;
    const mock = await startMockRelayer({
        onToolCall: () => "swallow",
        // Long enough that the write's own deadline expires while the parked
        // forward is still waiting on this handshake.
        sseGetDelayMs: (n) => (n === 2 ? 4000 : 0),
    });
    const bridge = startBridge(t, mock, {
        MEMWAL_MCP_CALL_TIMEOUT_MS: String(CALL_TIMEOUT_MS),
        MEMWAL_MCP_CALL_RETRIES: "0",
    });

    bridge.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await bridge.waitFor((m) => m.id === 1 && m.result, 10_000);
    await bridge.waitForConnected();

    // Drop the stream, then wait for the retry handshake to be IN PROGRESS.
    // That is what makes "the write parks on a reconnect" a fact rather than a
    // hope, without sleeping on a guess.
    mock.killLatestStream();
    await mock.waitForSseGet(2);

    bridge.send({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "memwal_remember", arguments: { text: "must not land" } },
    });

    const reply = await bridge.waitFor((m) => m.id === 3, 20_000);
    assert.equal(reply.result?.isError, true, "the parked write should expire into an error");
    assert.equal(reply.result?.structuredContent?.code, "MEMWAL_CALL_TIMEOUT");
    assert.equal(
        mock.getToolPostCount("memwal_remember"),
        0,
        "the write was answered before it was ever sent, so no POST should exist yet",
    );

    // The moment of the bug: the handshake lands, the parked forward wakes up
    // and posts a call the client was already told had failed.
    await mock.waitForSseEstablished(2, 20_000);
    await new Promise((r) => setTimeout(r, 1000));
    assert.equal(
        mock.getToolPostCount("memwal_remember"),
        0,
        "a call answered with a failure must never afterwards be written to the relayer",
    );
});

test("a request the reconnect already replayed is not posted a second time", async (t) => {
    // The other half of the parked-forward hazard. A request that arrives
    // during a reconnect is in the in-flight map, so the reconnect replays it
    // against the fresh session — and the parked forward then wakes up and
    // posts it again. Nothing has timed out here; the call simply goes to the
    // relayer twice, which for `memwal_remember` is the duplicate memory the
    // replay path documents as reconnect-owned and must not create.
    const mock = await startMockRelayer({
        onToolCall: () => "swallow",
        // Long enough for the write to be registered before the replay
        // snapshot is taken, short enough that nothing expires meanwhile.
        sseGetDelayMs: (n) => (n === 2 ? 1500 : 0),
    });
    const bridge = startBridge(t, mock, {
        // Far above anything this test does: no deadline may fire, so the only
        // thing that can produce a second POST is the double send.
        MEMWAL_MCP_CALL_TIMEOUT_MS: "30000",
        MEMWAL_MCP_CALL_RETRIES: "0",
    });

    bridge.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await bridge.waitFor((m) => m.id === 1 && m.result, 10_000);
    await bridge.waitForConnected();

    mock.killLatestStream();
    await mock.waitForSseGet(2);

    bridge.send({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "memwal_remember", arguments: { text: "exactly once" } },
    });

    await mock.waitForSseEstablished(2, 20_000);
    // Both sends, if there are two, happen as the reconnect resolves: the
    // replay from inside it and the parked forward immediately after.
    await new Promise((r) => setTimeout(r, 1500));
    assert.equal(
        mock.getToolPostCount("memwal_remember"),
        1,
        "the reconnect owns the replay, so the parked forward must not send it again",
    );
});

test("a call answered while its POST waits in the send queue is not sent either", async (t) => {
    // The bridge posts one message at a time. A call can therefore be answered
    // by the sweeper after the forwarding path has handed it to that queue but
    // before its POST actually runs — a window the forwarding path has already
    // passed through and cannot re-check. Same hazard as a parked forward: a
    // write reported as failed that lands anyway.
    const CALL_TIMEOUT_MS = 1200;
    const mock = await startMockRelayer({
        // Stall the first call's POST so the second one queues behind it for
        // longer than the second one's own deadline.
        onToolCall: (_msg, _session, seen) => (seen === 1 ? "hold" : "swallow"),
        holdMs: 4000,
    });
    const bridge = startBridge(t, mock, {
        MEMWAL_MCP_CALL_TIMEOUT_MS: String(CALL_TIMEOUT_MS),
        MEMWAL_MCP_CALL_RETRIES: "0",
    });

    bridge.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    await bridge.waitFor((m) => m.id === 1 && m.result, 10_000);
    await bridge.waitForConnected();

    // Blocks the send queue.
    bridge.send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "memwal_recall", arguments: { query: "hold the queue" } },
    });
    await mock.waitForToolPost("memwal_recall", 1);

    // Queued behind it, and answered long before its turn comes.
    bridge.send({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "memwal_remember", arguments: { text: "must not land" } },
    });

    const reply = await bridge.waitFor((m) => m.id === 3, 20_000);
    assert.equal(reply.result?.isError, true);
    assert.equal(
        mock.getToolPostCount("memwal_remember"),
        0,
        "answered while queued, so it was never sent",
    );

    // The queue drains once the held POST completes. That is when the write
    // would have gone out behind the client's back.
    await new Promise((r) => setTimeout(r, 4000));
    assert.equal(
        mock.getToolPostCount("memwal_remember"),
        0,
        "draining the send queue must not post a call that was already answered",
    );
});
