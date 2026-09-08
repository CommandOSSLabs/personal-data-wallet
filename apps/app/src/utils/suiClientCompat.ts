/**
 * Sui client compatibility layer. App.tsx's shared SuiClientProvider stays on
 * JSON-RPC (see the comment there for why), but callers may still receive a
 * SuiGrpcClient — e.g. the security-delete subsystem's own scoped client
 * (utils/suiClientFactory.ts). The two have different getObject and
 * dynamic-field shapes, so these helpers keep that cross-transport
 * compatibility at one boundary rather than letting every call site assume
 * one shape unconditionally.
 */

import { isSuiGrpcClient, type SuiGrpcClient } from '@mysten/sui/grpc'
import { fromBase64, fromHex, normalizeSuiAddress, toHex } from '@mysten/sui/utils'

interface JsonRpcClientLike {
    getObject(input: { id: string; options: { showContent: boolean } }): Promise<{
        data?: { content?: { fields?: unknown } }
    }>
    getDynamicFieldObject(input: {
        parentId: string
        name: { type: string; value: string }
    }): Promise<{ data?: { content?: { fields?: unknown } } }>
}

/**
 * Use the SDK brand rather than inferring transport from coincidental methods.
 */
export function isGrpcClient(suiClient: unknown): suiClient is SuiGrpcClient {
    return isSuiGrpcClient(suiClient)
}

// JSON-RPC's showContent wraps every nested Move struct in its own
// {type, fields, hasPublicTransfer} envelope (e.g. accounts.fields.id.id);
// gRPC's .json is fully flat (accounts.id). Strip every such wrapper
// recursively so both transports produce the same flat shape.
function unwrapJsonRpcFields(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(unwrapJsonRpcFields)
    if (value && typeof value === 'object') {
        const obj = value as Record<string, unknown>
        const inner = 'fields' in obj && typeof obj.fields === 'object' && obj.fields !== null ? obj.fields : obj
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(inner as Record<string, unknown>)) {
            out[k] = unwrapJsonRpcFields(v)
        }
        return out
    }
    return value
}

/** RPC 404 / NotExists — the object is not readable yet, not a fatal setup failure. */
export function isMissingObjectError(error: unknown): boolean {
    const status =
        error && typeof error === 'object' && 'status' in error
            ? Number((error as { status: unknown }).status)
            : undefined
    if (status === 404) return true
    const message = error instanceof Error ? error.message : String(error)
    return /unexpected status code:\s*404|status code:\s*404|notExists|not found/i.test(message)
}

/** Fetch a Move object's fields as a flat JS object, regardless of client transport. */
export async function fetchObjectJson(suiClient: unknown, objectId: string): Promise<Record<string, unknown> | null> {
    try {
        if (isGrpcClient(suiClient)) {
            const res = await suiClient.getObject({ objectId, include: { json: true } })
            return res.object.json ?? null
        }

        const res = await (suiClient as JsonRpcClientLike).getObject({ id: objectId, options: { showContent: true } })
        const content = res?.data?.content
        if (!content?.fields) return null
        return unwrapJsonRpcFields(content.fields) as Record<string, unknown>
    } catch (error) {
        if (isMissingObjectError(error)) return null
        throw error
    }
}

// The registry's inner Table object ID is an immutable on-chain constant —
// cache it so repeat account lookups skip the registry round trip.
const registryTableIdCache = new Map<string, string>()

const ACCOUNT_LOOKUP_RETRY_MS = [200, 500, 1000, 2000, 2000]

/** Test-only: drop the registry Table id cache. */
export function resetRegistryTableIdCache(): void {
    registryTableIdCache.clear()
}

function extractTableId(accounts: unknown): string | undefined {
    const rawId = (accounts as { id?: string | { id?: string } } | undefined)?.id
    return typeof rawId === 'string' ? rawId : rawId?.id
}

/** Extract the account created by create_account across JSON-RPC response variants. */
export function findCreatedAccountId(transaction: {
    objectChanges?: Array<Record<string, unknown>> | null
    events?: Array<Record<string, unknown>> | null
}): string | null {
    const createdAccount = transaction.objectChanges?.find(
        (change) =>
            change.type === 'created' &&
            typeof change.objectType === 'string' &&
            change.objectType.includes('::account::MemWalAccount'),
    )
    if (typeof createdAccount?.objectId === 'string') return createdAccount.objectId

    const accountCreatedEvent = transaction.events?.find(
        (event) =>
            typeof event.type === 'string' && event.type.endsWith('::account::AccountCreated'),
    )
    const parsedJson = accountCreatedEvent?.parsedJson
    if (parsedJson && typeof parsedJson === 'object') {
        const accountId = (parsedJson as { account_id?: unknown }).account_id
        if (typeof accountId === 'string') return accountId
    }

    return null
}

/** Resolve a MemWalAccount object ID for `ownerAddress` via the registry's Table<address, ID>. */
export async function fetchAccountIdForOwner(
    suiClient: unknown,
    registryId: string,
    ownerAddress: string,
): Promise<string | null> {
    try {
        let tableId = registryTableIdCache.get(registryId)
        if (!tableId) {
            const registryJson = await fetchObjectJson(suiClient, registryId)
            // gRPC json flattens the Table's UID to a plain string. Keep the nested
            // form solely for the explicit local JSON-RPC browser suite.
            tableId = extractTableId(registryJson?.accounts)
            if (!tableId) return null
            registryTableIdCache.set(registryId, tableId)
        }

        if (isGrpcClient(suiClient)) {
            const dynFieldRes = await suiClient.getDynamicField({
                parentId: tableId,
                name: { type: 'address', bcs: fromHex(normalizeSuiAddress(ownerAddress)) },
            })
            const valueBytes = dynFieldRes?.dynamicField?.value?.bcs
            if (!valueBytes || valueBytes.length !== 32) return null
            return '0x' + toHex(valueBytes)
        }

        const dynField = await (suiClient as JsonRpcClientLike).getDynamicFieldObject({
            parentId: tableId,
            name: { type: 'address', value: ownerAddress },
        })
        const content = dynField?.data?.content
        if (!content?.fields || typeof content.fields !== 'object') return null
        const value = (content.fields as Record<string, unknown>).value
        return typeof value === 'string' ? value : null
    } catch (error) {
        if (isMissingObjectError(error)) return null
        throw error
    }
}

/** Poll the registry until the account is readable, or the attempt budget is spent. */
export async function pollAccountIdForOwner(
    suiClient: unknown,
    registryId: string,
    ownerAddress: string,
    options?: {
        attempts?: number
        sleep?: (ms: number) => Promise<void>
    },
): Promise<string | null> {
    const attempts = options?.attempts ?? 6
    const sleep = options?.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
    for (let i = 0; i < attempts; i++) {
        const accountId = await fetchAccountIdForOwner(suiClient, registryId, ownerAddress)
        if (accountId) return accountId
        if (i < attempts - 1) {
            await sleep(ACCOUNT_LOOKUP_RETRY_MS[Math.min(i, ACCOUNT_LOOKUP_RETRY_MS.length - 1)])
        }
    }
    return null
}

/** Normalize a delegate key's public_key field to hex — gRPC encodes it as base64, JSON-RPC as number[]. */
export function publicKeyToHex(publicKey: unknown): string {
    if (typeof publicKey === 'string') return toHex(fromBase64(publicKey))
    if (Array.isArray(publicKey)) return toHex(new Uint8Array(publicKey as number[]))
    console.warn('[suiClientCompat] unrecognized public_key encoding', typeof publicKey)
    return ''
}
