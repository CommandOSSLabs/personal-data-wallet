import { SuiGrpcClient } from '@mysten/sui/grpc'

import { fetchAccountIdForOwner, fetchAddressKeyedU8, fetchObjectJson, isGrpcClient } from './suiClientCompat'

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

    it('reads a Table<address, u8> cell and treats missing rows as 0', async () => {
        const client = new SuiGrpcClient({ network: 'testnet', baseUrl: 'https://provider.example/grpc' })
        const getDynamicField = vi.spyOn(client, 'getDynamicField').mockResolvedValue({
            dynamicField: { value: { bcs: new Uint8Array([3]) } },
        } as never)
        await expect(fetchAddressKeyedU8(client, '0xtable', '0x1')).resolves.toBe(3)
        expect(getDynamicField).toHaveBeenCalledOnce()

        getDynamicField.mockRejectedValueOnce(new Error('not found'))
        await expect(fetchAddressKeyedU8(client, '0xtable', '0x1')).resolves.toBe(0)
    })
})
