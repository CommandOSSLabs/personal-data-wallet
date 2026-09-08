import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { buildDevWalletBundle } from "./support/buildDevWalletBundle.ts";

const ROOT = resolve(import.meta.dirname, "../../..");

function loadEnv(path: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const line of readFileSync(path, "utf8").split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
        const eq = trimmed.indexOf("=");
        out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
    return out;
}

const env = loadEnv(resolve(ROOT, "scripts/v2e2e/.env.local"));
const saved = JSON.parse(readFileSync(resolve(ROOT, "scripts/v2e2e/.secrets/e2e-run.json"), "utf8")) as {
    label: string;
};
const priv = env.SERVER_SUI_PRIVATE_KEY;
if (!priv) throw new Error("missing SERVER_SUI_PRIVATE_KEY");
const bundlePath = await buildDevWalletBundle();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
await context.addInitScript((cfg) => {
    (window as unknown as { __E2E_WALLET_CONFIG__: typeof cfg }).__E2E_WALLET_CONFIG__ = cfg;
}, {
    suiPrivateKey: priv,
    endpoint: env.SUI_GRPC_URL || "https://mysten-rpc.testnet.sui.io",
    transport: "grpc",
    network: "testnet",
});
await context.addInitScript({ path: bundlePath });
const page = await context.newPage();
page.setDefaultTimeout(45_000);
await page.goto("http://127.0.0.1:5173/");
const connect = page.getByRole("button", { name: /connect wallet/i });
if (await connect.isVisible().catch(() => false)) {
    await connect.click();
    const injected = page.getByRole("button", { name: /MemWal E2E Dev Wallet/i });
    if (await injected.isVisible().catch(() => false)) await injected.click();
}
await page.waitForURL(/\/(dashboard|setup)/, { timeout: 45_000 });
console.log("url", page.url());
if (page.url().includes("/setup")) {
    await page.goto("http://127.0.0.1:5173/dashboard");
}
const heading = page.getByText(/namespaces/i).first();
await heading.waitFor({ timeout: 30_000 });
console.log("PASS namespaces heading");
await page.getByText("Loading namespaces...").waitFor({ state: "hidden", timeout: 45_000 }).catch(() => {});
const bodyText = await page.locator("body").innerText();
console.log("page_text_snip", bodyText.slice(0, 1500));
await page.screenshot({ path: resolve(ROOT, "scripts/v2e2e/.secrets/dashboard.png"), fullPage: true });
if (!bodyText.includes(saved.label)) {
    throw new Error(`namespace label ${saved.label} not on page`);
}
console.log("PASS listed", saved.label);
await page.screenshot({ path: resolve(ROOT, "scripts/v2e2e/.secrets/dashboard.png"), fullPage: true });
await browser.close();
console.log("ALL_DASHBOARD_E2E_PASS");
