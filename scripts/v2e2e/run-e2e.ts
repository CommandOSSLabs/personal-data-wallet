/**
 * Live testnet + local Oyster/relayer E2E for the V2 vertical slice.
 * Loads scripts/v2e2e/.env.local (gitignored). Does not print secrets.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { MemWal } from "../../packages/sdk/src/memwal.ts";
import {
    createNamespace,
    cryptoShredKeyVersion,
    generateAndWrapNamespaceDek,
    grantAccess,
    initializeKey,
    namespaceSealKeyId,
    revokeAccess,
    rotateKey,
} from "../../packages/sdk/src/namespace.ts";
import { addDelegateKey, generateDelegateKey } from "../../packages/sdk/src/account.ts";

const SUI_CLOCK = "0x0000000000000000000000000000000000000000000000000000000000000006";
const E_NO_READ = 16;
const E_NO_WRITE = 17;
const E_KEY_SHREDDED = 25;

const ROOT = resolve(import.meta.dirname, "../..");
const ENV_PATH = resolve(ROOT, "scripts/v2e2e/.env.local");
const ARTIFACT = resolve(ROOT, "scripts/v2e2e/.secrets/e2e-run.json");

function loadEnv(path: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const line of readFileSync(path, "utf8").split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        out[key] = value;
    }
    return out;
}

function req(env: Record<string, string>, key: string): string {
    const v = env[key];
    if (!v) throw new Error(`missing ${key} in ${ENV_PATH}`);
    return v;
}

function pass(name: string, extra = "") {
    console.log(`PASS  ${name}${extra ? `  ${extra}` : ""}`);
}

function fail(name: string, err: unknown): never {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`FAIL  ${name}: ${msg}`);
    throw err instanceof Error ? err : new Error(msg);
}

async function withRetry<T>(name: string, fn: () => Promise<T>, attempts = 4): Promise<T> {
    let last: unknown;
    for (let i = 1; i <= attempts; i++) {
        try {
            return await fn();
        } catch (e) {
            last = e;
            const msg = e instanceof Error ? e.message : String(e);
            console.warn(`retry ${name} ${i}/${attempts}: ${msg.slice(0, 180)}`);
            await new Promise((r) => setTimeout(r, 1500 * i));
        }
    }
    fail(name, last);
}

async function waitFor(url: string, label: string, timeoutMs = 120_000) {
    const start = Date.now();
    let last = "";
    while (Date.now() - start < timeoutMs) {
        try {
            const res = await fetch(url);
            if (res.ok) {
                pass(`health ${label}`, `${res.status} ${url}`);
                return;
            }
            last = `${res.status}`;
        } catch (e) {
            last = e instanceof Error ? e.message : String(e);
        }
        await new Promise((r) => setTimeout(r, 1500));
    }
    fail(`health ${label}`, new Error(`timeout waiting for ${url}: ${last}`));
}

function dump(value: unknown): string {
    try {
        return JSON.stringify(value, (_key, inner) =>
            typeof inner === "bigint" ? inner.toString() : inner,
        );
    } catch {
        return String(value);
    }
}

function abortCodeFrom(text: string): number | null {
    const moveAbort = text.match(/MoveAbort[\s\S]{0,800}?,\s*(\d+)\s*\)/);
    if (moveAbort) return Number(moveAbort[1]);
    const named = text.match(/abort(?:Code|_code)"?\s*[:=]\s*"?(\d+)/i);
    if (named) return Number(named[1]);
    return null;
}

function txDigest(result: any): string | undefined {
    return result?.Transaction?.digest
        ?? result?.FailedTransaction?.digest
        ?? result?.digest;
}

function txSucceeded(result: any): boolean {
    const data = result?.Transaction ?? result?.FailedTransaction ?? result;
    const status = data?.status ?? data?.effects?.status;
    return status?.success === true
        || (status?.success === undefined && status?.status === "success");
}

async function namespaceCall(opts: {
    packageId: string;
    functionName: string;
    suiPrivateKey: string;
    suiClient: any;
    makeArgs: (tx: any) => any[];
}): Promise<{ digest: string; result: any }> {
    const { Transaction } = await import("@mysten/sui/transactions");
    const { decodeSuiPrivateKey } = await import("@mysten/sui/cryptography");
    const { Ed25519Keypair } = await import("@mysten/sui/keypairs/ed25519");
    const { secretKey } = decodeSuiPrivateKey(opts.suiPrivateKey);
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);
    const tx = new Transaction();
    tx.moveCall({
        target: `${opts.packageId}::namespace::${opts.functionName}`,
        arguments: opts.makeArgs(tx),
    });
    const executionResult = await opts.suiClient.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
    });
    const digest = txDigest(executionResult);
    if (!digest) {
        throw new Error(`no digest from ${opts.functionName}: ${dump(executionResult)}`);
    }
    const waited = await opts.suiClient.waitForTransaction({
        digest,
        include: { effects: true },
        options: { showEffects: true },
    });
    return { digest, result: waited };
}

async function expectAbort(
    name: string,
    abortCode: number,
    fn: () => Promise<{ digest: string; result: any }>,
    attempts = 4,
): Promise<void> {
    let last: unknown;
    for (let i = 1; i <= attempts; i++) {
        try {
            const { digest, result } = await fn();
            if (txSucceeded(result)) {
                fail(name, new Error(`expected MoveAbort ${abortCode}, succeeded ${digest}`));
            }
            const text = dump(result);
            const got = abortCodeFrom(text);
            if (got === abortCode) {
                pass(name, `abort=${abortCode} digest=${digest}`);
                return;
            }
            if (got !== null) {
                fail(name, new Error(`expected abort ${abortCode}, got ${got} ${text.slice(0, 600)}`));
            }
            last = new Error(`no MoveAbort in ${text.slice(0, 400)}`);
        } catch (e) {
            const text = e instanceof Error ? `${e.message}\n${dump(e)}` : dump(e);
            const got = abortCodeFrom(text);
            if (got === abortCode) {
                pass(name, `abort=${abortCode}`);
                return;
            }
            if (got !== null) {
                fail(name, new Error(`expected abort ${abortCode}, got ${got} ${text.slice(0, 600)}`));
            }
            last = e;
        }
        console.warn(`retry ${name} ${i}/${attempts}: ${last instanceof Error ? last.message.slice(0, 180) : dump(last).slice(0, 180)}`);
        await new Promise((r) => setTimeout(r, 1500 * i));
    }
    fail(name, last);
}

async function transferSui(opts: {
    suiPrivateKey: string;
    suiClient: any;
    to: string;
    amountMist: bigint;
}): Promise<string> {
    const { Transaction } = await import("@mysten/sui/transactions");
    const { decodeSuiPrivateKey } = await import("@mysten/sui/cryptography");
    const { Ed25519Keypair } = await import("@mysten/sui/keypairs/ed25519");
    const { secretKey } = decodeSuiPrivateKey(opts.suiPrivateKey);
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [opts.amountMist]);
    tx.transferObjects([coin], opts.to);
    const executionResult = await opts.suiClient.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
    });
    const digest = txDigest(executionResult);
    if (!digest) throw new Error(`fund: no digest ${dump(executionResult)}`);
    const waited = await opts.suiClient.waitForTransaction({
        digest,
        include: { effects: true },
        options: { showEffects: true },
    });
    if (!txSucceeded(waited)) {
        throw new Error(`fund failed ${digest}: ${dump(waited)}`);
    }
    return digest;
}

async function recallMustInclude(
    memwal: InstanceType<typeof MemWal>,
    query: string,
    needle: string,
    name: string,
) {
    return withRetry(name, async () => {
        const recalled = await memwal.recall({ query, limit: 5 });
        const hit = recalled.results.find((r) => r.text.includes(needle));
        if (!hit) throw new Error(`no hit in ${JSON.stringify(recalled)}`);
        pass(name, `text=${hit.text.slice(0, 80)}`);
        return recalled;
    });
}

async function main() {
    const resumeOnly = process.argv.includes("--resume");
    const recallOnly = process.argv.includes("--recall-only");
    const aclOnly = process.argv.includes("--acl");
    const env = loadEnv(ENV_PATH);
    const packageId = req(env, "MEMWAL_V2_PACKAGE_ID");
    const accountRegistryId = req(env, "MEMWAL_V2_REGISTRY_ID");
    const namespaceRegistryId = req(env, "MEMWAL_V2_NAMESPACE_REGISTRY_ID");
    const accountId = req(env, "MEMWAL_ACCOUNT_ID");
    const suiPrivateKey = req(env, "SERVER_SUI_PRIVATE_KEY");
    const writer = req(env, "MEMWAL_V2_WRITER_ADDRESSES").split(",")[0]!;
    const oysterBase = req(env, "OYSTER_BASE_URL");
    const oysterKey = req(env, "OYSTER_API_KEY");
    const oysterBucket = env.OYSTER_BUCKET || "v2e2e-ns";
    const relayer = env.SIDECAR_URL ? "http://127.0.0.1:8000" : "http://127.0.0.1:8000";
    const sealConfigs = JSON.parse(req(env, "SEAL_SERVER_CONFIGS")) as Array<{
        objectId: string;
        weight?: number;
        aggregatorUrl?: string;
    }>;
    const threshold = Number(env.SEAL_THRESHOLD || "1");
    const ducnmm = "0x3103b5ddad293bb00cf9b54061684293a829f2a65a7c560925e954f6e14a781f";
    const label = `e2e-live-${Date.now()}`;
    const memoryText = `v2 e2e peanut allergy ${label}`;

    const suiClient = new SuiGrpcClient({
        network: "testnet",
        baseUrl: env.SUI_GRPC_URL || "https://fullnode.testnet.sui.io:443",
    });

    // 1. Oyster API is up (list buckets). Do not GET the old Walrus-backed
    // spike blob — that path downloads a 66MB encoded unit and hangs.
    {
        const res = await fetch(`${oysterBase}/buckets`, {
            headers: { Authorization: `Bearer ${oysterKey}` },
        });
        const body = await res.text();
        if (!res.ok) fail("oyster list buckets", new Error(`${res.status} ${body.slice(0, 200)}`));
        if (!body.includes(oysterBucket) && !body.includes("bucket")) {
            pass("oyster list buckets", `status=${res.status} body=${body.slice(0, 120)}`);
        } else {
            pass("oyster list buckets", `status=${res.status}`);
        }
        void oysterBucket;
    }

    await waitFor("http://127.0.0.1:8000/health", "relayer");
    const version = await (await fetch("http://127.0.0.1:8000/version")).json() as {
        featureFlags?: Record<string, boolean>;
    };
    if (!version.featureFlags?.["runtime.v2WriteFence"]) {
        fail("relayer v2 flags", new Error(`flags=${JSON.stringify(version.featureFlags)}`));
    }
    pass("relayer v2 flags", JSON.stringify(version.featureFlags));

    if (recallOnly || resumeOnly) {
        const saved = JSON.parse(readFileSync(ARTIFACT, "utf8")) as {
            label: string;
            namespaceId: string;
            accountId: string;
            delegatePrivateKeyHex: string;
            memoryText: string;
        };
        const memwal = MemWal.create({
            key: saved.delegatePrivateKeyHex,
            accountId: saved.accountId,
            serverUrl: relayer,
            namespace: saved.label,
        });
        if (!recallOnly) {
            const accepted = await memwal.remember(saved.memoryText);
            pass("remember accepted", accepted.job_id);
            const done = await memwal.waitForRememberJob(accepted.job_id, { timeoutMs: 600_000 });
            pass("remember done", `blob=${done.blob_id}`);
        }
        await recallMustInclude(memwal, "peanut allergy", saved.label, "recall decrypt");
        console.log("ALL_E2E_PASS", JSON.stringify({ label: saved.label, namespaceId: saved.namespaceId }));
        return;
    }

    const txBase = {
        packageId,
        namespaceRegistryId,
        accountRegistryId,
        accountId,
        suiPrivateKey,
        suiClient,
        suiNetwork: "testnet" as const,
    };

    let namespaceId: string;
    let memwal: InstanceType<typeof MemWal>;
    let jobId = "";
    let added = { digest: "acl-resume" };
    let created = { digest: "acl-resume" };
    let init = { digest: "acl-resume" };
    let grantAgent = { digest: "acl-resume" };
    let grantB = { digest: "acl-resume" };
    let liveLabel = label;
    let liveMemoryText = memoryText;

    if (aclOnly) {
        const saved = JSON.parse(readFileSync(ARTIFACT, "utf8")) as {
            label: string;
            namespaceId: string;
            accountId: string;
            delegatePrivateKeyHex: string;
            memoryText: string;
        };
        liveLabel = saved.label;
        liveMemoryText = saved.memoryText;
        namespaceId = saved.namespaceId;
        memwal = MemWal.create({
            key: saved.delegatePrivateKeyHex,
            accountId: saved.accountId,
            serverUrl: relayer,
            namespace: saved.label,
        });
        pass("acl resume", `${saved.label} ${saved.namespaceId}`);
        await recallMustInclude(memwal, "peanut allergy", saved.label, "recall decrypt");
    } else {
        const delegate = await generateDelegateKey();
        pass("generateDelegateKey", `sui=${delegate.suiAddress.slice(0, 10)}…`);

        added = await withRetry("addDelegateKey", () =>
            addDelegateKey({
                packageId,
                registryId: accountRegistryId,
                accountId,
                publicKey: delegate.publicKey,
                label: `e2e-agent-${label.slice(-6)}`,
                suiPrivateKey,
                suiClient,
                suiNetwork: "testnet",
            }),
        );
        pass("addDelegateKey", added.digest);

        created = await withRetry("createNamespace", () =>
            createNamespace({ ...txBase, label }),
        );
        namespaceId = created.namespaceId;
        pass("createNamespace", `${label} ${namespaceId} ${created.digest}`);

        const wrapped = await withRetry("generateAndWrapNamespaceDek", () =>
            generateAndWrapNamespaceDek({
                packageId,
                namespaceId,
                keyVersion: 0n,
                threshold,
                sealServerConfigs: sealConfigs,
                suiClient,
                suiNetwork: "testnet",
            }),
        );
        const wrappedDek = wrapped.wrappedDek;
        pass("generateAndWrapNamespaceDek", `wrapped=${wrappedDek.length}b`);

        init = await withRetry("initializeKey", () =>
            initializeKey({ ...txBase, namespaceId, wrappedDek }),
        );
        pass("initializeKey", init.digest);

        grantAgent = await withRetry("grantAccess HTTP agent WRITE", () =>
            grantAccess({
                ...txBase,
                namespaceId,
                principal: delegate.suiAddress,
                canRead: true,
                canWrite: true,
                canShare: false,
            }),
        );
        pass("grantAccess HTTP agent WRITE", grantAgent.digest);

        grantB = await withRetry("grantAccess wallet B READ", () =>
            grantAccess({
                ...txBase,
                namespaceId,
                principal: ducnmm,
                canRead: true,
                canWrite: false,
                canShare: false,
            }),
        );
        pass("grantAccess wallet B READ", grantB.digest);

        mkdirSync(resolve(ROOT, "scripts/v2e2e/.secrets"), { recursive: true });
        writeFileSync(
            ARTIFACT,
            JSON.stringify(
                {
                    label,
                    namespaceId,
                    accountId,
                    delegateSuiAddress: delegate.suiAddress,
                    delegatePrivateKeyHex: delegate.privateKey,
                    memoryText,
                },
                null,
                2,
            ),
        );

        memwal = MemWal.create({
            key: delegate.privateKey,
            accountId,
            serverUrl: relayer,
            namespace: label,
        });

        try {
            const accepted = await memwal.remember(memoryText);
            jobId = accepted.job_id;
            pass("remember accepted", jobId);
            const done = await memwal.waitForRememberJob(accepted.job_id, { timeoutMs: 180_000 });
            pass("remember done", `blob=${done.blob_id}`);
        } catch (e) {
            fail("remember", e);
        }

        await recallMustInclude(memwal, "peanut allergy", label, "recall decrypt");
    }

    const { Ed25519Keypair } = await import("@mysten/sui/keypairs/ed25519");
    const stranger = Ed25519Keypair.generate();
    const strangerAddr = stranger.getPublicKey().toSuiAddress();
    const strangerKey = stranger.getSecretKey();
    pass("stranger keypair", strangerAddr);

    const fundDigest = await withRetry("fund stranger", () =>
        transferSui({
            suiPrivateKey,
            suiClient,
            to: strangerAddr,
            amountMist: 100_000_000n,
        }),
    );
    pass("fund stranger", fundDigest);

    const nsObjects = {
        namespaceRegistryId,
        accountRegistryId,
        accountId,
        namespaceId,
    };
    const sealId = (version: number) => namespaceSealKeyId(namespaceId, version);
    const commitment = new Uint8Array(32).fill(7);

    const sealApprove = (key: string, version: number) =>
        namespaceCall({
            packageId,
            functionName: "seal_approve",
            suiPrivateKey: key,
            suiClient,
            makeArgs: (tx) => [
                tx.pure("vector<u8>", Array.from(sealId(version))),
                tx.object(nsObjects.namespaceRegistryId),
                tx.object(nsObjects.accountRegistryId),
                tx.object(nsObjects.accountId),
                tx.object(nsObjects.namespaceId),
            ],
        });

    const fence = (key: string, version: number) =>
        namespaceCall({
            packageId,
            functionName: "write_fence",
            suiPrivateKey: key,
            suiClient,
            makeArgs: (tx) => [
                tx.pure("vector<u8>", Array.from(sealId(version))),
                tx.object(nsObjects.namespaceRegistryId),
                tx.object(nsObjects.accountRegistryId),
                tx.object(nsObjects.accountId),
                tx.object(nsObjects.namespaceId),
                tx.pure("vector<u8>", Array.from(commitment)),
                tx.object(SUI_CLOCK),
            ],
        });

    await expectAbort("unauthorized seal_approve", E_NO_READ, () =>
        sealApprove(strangerKey, 0),
    );
    await expectAbort("unauthorized write_fence", E_NO_WRITE, () =>
        fence(strangerKey, 0),
    );

    const wrapV1 = await withRetry("wrap DEK v1", () =>
        generateAndWrapNamespaceDek({
            packageId,
            namespaceId,
            keyVersion: 1n,
            threshold,
            sealServerConfigs: sealConfigs,
            suiClient,
            suiNetwork: "testnet",
        }),
    );
    pass("wrap DEK v1", `wrapped=${wrapV1.wrappedDek.length}b`);

    const rotated = await withRetry("rotateKey v0→v1", () =>
        rotateKey({ ...txBase, namespaceId, newWrappedDek: wrapV1.wrappedDek }),
    );
    pass("rotateKey v0→v1", rotated.digest);

    await recallMustInclude(memwal, "peanut allergy", liveLabel, "recall after rotate");

    const memoryTextV1 = `v2 e2e rotated key ${liveLabel}`;
    let jobIdV1 = "";
    try {
        const accepted = await memwal.remember(memoryTextV1);
        jobIdV1 = accepted.job_id;
        pass("remember v1 accepted", jobIdV1);
        const done = await memwal.waitForRememberJob(accepted.job_id, { timeoutMs: 180_000 });
        pass("remember v1 done", `blob=${done.blob_id}`);
    } catch (e) {
        fail("remember v1", e);
    }

    await recallMustInclude(memwal, "rotated key", "rotated key", "recall v1");

    const grantU = await withRetry("grantAccess stranger READ", () =>
        grantAccess({
            ...txBase,
            namespaceId,
            principal: strangerAddr,
            canRead: true,
            canWrite: false,
            canShare: false,
        }),
    );
    pass("grantAccess stranger READ", grantU.digest);

    const grantedApprove = await withRetry("granted seal_approve", async () => {
        const { digest, result } = await sealApprove(strangerKey, 1);
        if (!txSucceeded(result)) {
            throw new Error(`granted seal_approve failed ${digest}: ${dump(result)}`);
        }
        return { digest };
    });
    pass("granted seal_approve", grantedApprove.digest);

    const wrapV2 = await withRetry("wrap DEK v2", () =>
        generateAndWrapNamespaceDek({
            packageId,
            namespaceId,
            keyVersion: 2n,
            threshold,
            sealServerConfigs: sealConfigs,
            suiClient,
            suiNetwork: "testnet",
        }),
    );
    pass("wrap DEK v2", `wrapped=${wrapV2.wrappedDek.length}b`);

    const revoked = await withRetry("revokeAccess stranger", () =>
        revokeAccess({
            ...txBase,
            namespaceId,
            principal: strangerAddr,
            newWrappedDek: wrapV2.wrappedDek,
        }),
    );
    pass("revokeAccess stranger", revoked.digest);

    await expectAbort("revoked seal_approve", E_NO_READ, () =>
        sealApprove(strangerKey, 1),
    );

    await recallMustInclude(memwal, "peanut allergy", liveLabel, "recall after revoke");

    const shredded = await withRetry("cryptoShredKeyVersion v0", () =>
        cryptoShredKeyVersion({ ...txBase, namespaceId, keyVersion: 0 }),
    );
    pass("cryptoShredKeyVersion v0", shredded.digest);

    await expectAbort("shredded seal_approve v0", E_KEY_SHREDDED, () =>
        sealApprove(suiPrivateKey, 0),
    );

    const peanut = await withRetry("recall shredded v0", async () => {
        const recalled = await memwal.recall({ query: "peanut allergy", limit: 5 });
        const stale = recalled.results.find((r) => r.text.includes("peanut allergy") && r.text.includes(liveLabel));
        if (stale) {
            throw new Error(`v0 plaintext still present: ${JSON.stringify(recalled)}`);
        }
        return recalled;
    });
    pass("recall shredded v0", `v0 plaintext absent hits=${peanut.results.length}`);
    await recallMustInclude(memwal, "rotated key", "rotated key", "recall v1 after shred");

    console.log("ALL_E2E_PASS", JSON.stringify({
        label: liveLabel,
        namespaceId,
        jobId,
        jobIdV1,
        strangerAddr,
        digests: {
            addDelegate: added.digest,
            createNamespace: created.digest,
            initializeKey: init.digest,
            grantAgent: grantAgent.digest,
            grantB: grantB.digest,
            rotateKey: rotated.digest,
            grantStranger: grantU.digest,
            revokeStranger: revoked.digest,
            shredV0: shredded.digest,
        },
    }));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
