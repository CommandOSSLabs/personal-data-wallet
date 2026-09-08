import { SuiGrpcClient } from '@mysten/sui/grpc'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
    fetchAccountIdForOwner,
    fetchObjectJson,
    findCreatedAccountId,
    isGrpcClient,
    isMissingObjectError,
    pollAccountIdForOwner,
    resetRegistryTableIdCache,
} from './suiClientCompat'

afterEach(() => {
    resetRegistryTableIdCache()
})

describe('gRPC Sui client compatibility', () => {
    it('uses the gRPC getObject request shape', async () => {
        const client = new SuiGrpcClient({ network: 'testnet', baseUrl: 'https://provider.example/grpc' })
        const getObject = vi.spyOn(client, 'getObject').mockResolvedValue({
            object: { json: { accounts: { id: '0xtable' } } },
        } as never)

        await expect(fetchObjectJson(client, '0xregistry')).resolves.toEqual({ accounts: { id: '0xtable' } })
        expect(isGrpcClient(client)).toBe(true)
        expect(getObject).toHaveBeenCalledWith({ objectId: '0xregistry', include: { json: true } })
    })

    it('encodes the address dynamic-field key as bytes', async () => {
        const client = new SuiGrpcClient({ network: 'testnet', baseUrl: 'https://provider.example/grpc' })
        vi.spyOn(client, 'getObject').mockResolvedValue({
            object: { json: { accounts: { id: '0xtable2' } } },
        } as never)
        const accountBytes = new Uint8Array(32).fill(0xab)
        const getDynamicField = vi.spyOn(client, 'getDynamicField').mockResolvedValue({
            dynamicField: { value: { bcs: accountBytes } },
        } as never)

        await expect(fetchAccountIdForOwner(client, '0xregistry2', '0x1')).resolves.toBe(`0x${'ab'.repeat(32)}`)
        expect(getDynamicField).toHaveBeenCalledOnce()
        const request = getDynamicField.mock.calls[0]![0]
        expect(request.parentId).toBe('0xtable2')
        expect(request.name.type).toBe('address')
        expect(request.name.bcs).toEqual(new Uint8Array(32).fill(0).map((_, i) => i === 31 ? 1 : 0))
    })
})

describe('JSON-RPC registry lookup', () => {
    it('unwraps accounts.id.id before getDynamicFieldObject', async () => {
        const tableId = '0xtable'
        const accountId = '0xaccount'
        let requestedParentId: string | undefined
        const client = {
            async getObject() {
                return {
                    data: {
                        content: {
                            fields: {
                                accounts: {
                                    type: '0x2::table::Table<address, 0x2::object::ID>',
                                    fields: {
                                        id: { id: tableId },
                                        size: '1',
                                    },
                                },
                            },
                        },
                    },
                }
            },
            async getDynamicFieldObject({ parentId }: { parentId: string }) {
                requestedParentId = parentId
                return { data: { content: { fields: { value: accountId } } } }
            },
        }

        await expect(fetchAccountIdForOwner(client, '0xregistry-json', '0xowner')).resolves.toBe(accountId)
        expect(requestedParentId).toBe(tableId)
    })

    it('returns null instead of throwing a GetObject 404', async () => {
        const client = {
            async getObject() {
                throw Object.assign(new Error('Unexpected status code: 404 ()'), { status: 404 })
            },
        }

        await expect(fetchObjectJson(client, '0xmissing')).resolves.toBeNull()
        expect(isMissingObjectError(Object.assign(new Error('Unexpected status code: 404 ()'), { status: 404 }))).toBe(true)
    })

    it('returns null when the dynamic field 404s', async () => {
        const client = {
            async getObject() {
                return { data: { content: { fields: { accounts: { fields: { id: { id: '0xtable3' } } } } } } }
            },
            async getDynamicFieldObject() {
                throw Object.assign(new Error('Unexpected status code: 404 ()'), { status: 404 })
            },
        }

        await expect(fetchAccountIdForOwner(client, '0xregistry-404', '0xowner')).resolves.toBeNull()
    })

    it('retries a transient miss then returns the account id', async () => {
        let lookups = 0
        const client = {
            async getObject() {
                return { data: { content: { fields: { accounts: { fields: { id: { id: '0xtable4' } } } } } } }
            },
            async getDynamicFieldObject() {
                lookups += 1
                if (lookups < 3) {
                    throw Object.assign(new Error('Unexpected status code: 404 ()'), { status: 404 })
                }
                return { data: { content: { fields: { value: '0xaccount-ready' } } } }
            },
        }

        await expect(
            pollAccountIdForOwner(client, '0xregistry-retry', '0xowner', {
                attempts: 4,
                sleep: async () => undefined,
            }),
        ).resolves.toBe('0xaccount-ready')
        expect(lookups).toBe(3)
    })
})

describe('findCreatedAccountId', () => {
    it('falls back to the AccountCreated event when objectChanges omit the account', () => {
        expect(
            findCreatedAccountId({
                objectChanges: [],
                events: [
                    {
                        type: '0xpackage::account::AccountCreated',
                        parsedJson: { account_id: '0xaccount-from-event' },
                    },
                ],
            }),
        ).toBe('0xaccount-from-event')
    })
})

