import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { MemWalSession } from "../auth.js";
import { createMcpServer } from "../server.js";

// WALM-390 item 3: memwal_health reported status + version only. Nothing said
// WHICH relayer answered, so a config pointing at the wrong network looked
// perfectly healthy right up until the memories were missing.

const RELAYER = "https://relayer-staging.memory.walrus.xyz";

async function callHealth(t: TestContext, session: Partial<MemWalSession>): Promise<string> {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createMcpServer({
        oauthScope: "memwal:read",
        memwal: { health: async () => ({ status: "ok", version: "1.2.3" }) },
        ...session,
    } as unknown as MemWalSession);
    const client = new Client({ name: "health-test", version: "1.0.0" });
    t.after(async () => {
        await client.close();
        await server.close();
    });
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const res = (await client.callTool({ name: "memwal_health", arguments: {} })) as {
        content: { type: string; text: string }[];
    };
    return res.content.map((c) => c.text).join("\n");
}

test("memwal_health names the relayer that answered", async (t) => {
    const text = await callHealth(t, { relayerUrl: RELAYER });
    assert.ok(text.includes(RELAYER), `relayer URL missing from health output:\n${text}`);
    // Existing contract must survive.
    assert.ok(text.includes("status=ok"));
    assert.ok(text.includes("version=1.2.3"));
});

test("memwal_health still answers when the relayer URL is unknown", async (t) => {
    const text = await callHealth(t, { relayerUrl: undefined });
    assert.ok(text.includes("status=ok"), `health broke without a relayer URL:\n${text}`);
});
