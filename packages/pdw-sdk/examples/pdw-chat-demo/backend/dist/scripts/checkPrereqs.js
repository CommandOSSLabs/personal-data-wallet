import { loadConfig } from '../config/env.js';
import { Client } from 'pg';
function logResult(result) {
    const status = result.passed ? 'PASS' : 'FAIL';
    const color = result.passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    console.log(`${color}[${status}]${reset} ${result.name}: ${result.message}`);
}
async function checkPostgres(connectionString, useSsl) {
    const client = new Client({
        connectionString,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });
    try {
        const start = Date.now();
        await client.connect();
        await client.query('SELECT 1');
        const duration = Date.now() - start;
        return {
            name: 'Postgres',
            passed: true,
            message: `Connected successfully in ${duration}ms`,
        };
    }
    catch (error) {
        return {
            name: 'Postgres',
            passed: false,
            message: error instanceof Error ? error.message : String(error),
        };
    }
    finally {
        await client.end().catch(() => undefined);
    }
}
async function checkSuiRpc(url) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'sui_getChainIdentifier',
                params: [],
            }),
            signal: AbortSignal.timeout(7000),
        });
        if (!response.ok) {
            return {
                name: 'Sui RPC',
                passed: false,
                message: `Unexpected status ${response.status}`,
            };
        }
        const payload = (await response.json());
        if (!('result' in payload) || payload.result === undefined) {
            return {
                name: 'Sui RPC',
                passed: false,
                message: 'No result returned from sui_getChainIdentifier',
            };
        }
        return {
            name: 'Sui RPC',
            passed: true,
            message: 'sui_getChainIdentifier responded successfully',
        };
    }
    catch (error) {
        return {
            name: 'Sui RPC',
            passed: false,
            message: error instanceof Error ? error.message : String(error),
        };
    }
}
async function checkGemini(apiKey, model) {
    try {
        const url = new URL('https://generativelanguage.googleapis.com/v1beta/models');
        url.searchParams.set('key', apiKey);
        url.searchParams.set('pageSize', '1');
        const response = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(7000),
        });
        if (!response.ok) {
            return {
                name: 'Google Gemini',
                passed: false,
                message: `Unexpected status ${response.status}`,
            };
        }
        const payload = (await response.json());
        if (!payload.models || payload.models.length === 0) {
            return {
                name: 'Google Gemini',
                passed: false,
                message: 'Models list is empty; check API key permissions',
            };
        }
        const matched = payload.models.some((item) => item.name?.includes(model));
        return {
            name: 'Google Gemini',
            passed: matched,
            message: matched
                ? `API key is active (found model containing "${model}")`
                : `API key valid, but did not find a model matching "${model}"`,
        };
    }
    catch (error) {
        return {
            name: 'Google Gemini',
            passed: false,
            message: error instanceof Error ? error.message : String(error),
        };
    }
}
async function checkWalrus(relay) {
    if (!relay) {
        return null;
    }
    try {
        const endpoint = new URL('/v1/tip-config', relay).toString();
        const response = await fetch(endpoint, {
            method: 'GET',
            signal: AbortSignal.timeout(7000),
        });
        if (!response.ok) {
            return {
                name: 'Walrus Upload Relay',
                passed: false,
                message: `Unexpected status ${response.status}`,
            };
        }
        const payload = (await response.json());
        const mode = payload.send_tip ? 'paid' : 'free';
        return {
            name: 'Walrus Upload Relay',
            passed: true,
            message: `tip-config reachable (${mode} mode)`,
        };
    }
    catch (error) {
        return {
            name: 'Walrus Upload Relay',
            passed: false,
            message: error instanceof Error ? error.message : String(error),
        };
    }
}
async function main() {
    const config = loadConfig();
    const checks = [
        checkPostgres(config.databaseUrl, Boolean(config.databaseSsl)),
        checkSuiRpc(config.suiRpcUrl),
        checkGemini(config.geminiApiKey, config.geminiModel),
        checkWalrus(config.walrusUploadRelay),
    ];
    const results = await Promise.all(checks);
    let anyFailures = false;
    for (const result of results) {
        if (!result) {
            continue;
        }
        logResult(result);
        if (!result.passed) {
            anyFailures = true;
        }
    }
    if (config.pdwApiUrl) {
        console.log('[INFO] PDW API URL configured at', config.pdwApiUrl);
    }
    else {
        console.log('[WARN] No PDW API URL configured; SDK calls will default to local relay expectations.');
    }
    if (config.pdwContextAppId) {
        console.log('[INFO] PDW context app ID:', config.pdwContextAppId);
    }
    if (anyFailures) {
        process.exitCode = 1;
    }
}
main().catch((error) => {
    console.error('Unexpected error while checking prerequisites:', error);
    process.exitCode = 1;
});
