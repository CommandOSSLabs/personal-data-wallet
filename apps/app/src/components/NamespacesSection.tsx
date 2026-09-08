import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    useCurrentAccount,
    useSignPersonalMessage,
    useSuiClient,
} from '@mysten/dapp-kit'
import { Copy, Plus, RefreshCw } from 'lucide-react'
import { useDelegateKey } from '../App'
import { Card } from './Card'
import { config } from '../config'
import { useSponsoredTransaction } from '../hooks/useSponsoredTransaction'
import { useV2Namespaces } from '../hooks/useV2Namespaces'
import {
    cancelV2UninitializedNamespace,
    compactObjectId,
    createV2Namespace,
    generateAndWrapNamespaceDek,
    grantV2NamespaceAccess,
    initializeV2NamespaceKey,
    NAMESPACE_LABEL_MAX_LENGTH,
    normalizeLabelForSubmit,
    principalsToGrant,
    readV2NamespaceRow,
    sanitizeLabelInput,
    suiAddressFromEd25519PublicKeyHex,
    validateNamespaceLabel,
    v2ConfigReady,
    type GrantBits,
    type WalletSignerLike,
} from '../utils/v2Namespace'

export default function NamespacesSection({ previewMode = false }: { previewMode?: boolean }) {
    const currentAccount = useCurrentAccount()
    const suiClient = useSuiClient()
    const { mutateAsync: signAndExecuteTx } = useSponsoredTransaction()
    const { mutateAsync: signPersonalMsg } = useSignPersonalMessage()
    const { delegatePublicKey } = useDelegateKey()
    const owner = previewMode ? '' : (currentAccount?.address || '')
    const {
        namespaces,
        v2AccountId,
        loading,
        error,
        refresh,
        upsertNamespace,
        removeNamespace,
    } = useV2Namespaces(owner)

    const [showCreate, setShowCreate] = useState(false)
    const [newLabel, setNewLabel] = useState('memories')
    const [creating, setCreating] = useState(false)
    const [createPhase, setCreatePhase] = useState('')
    const [createError, setCreateError] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [finishing, setFinishing] = useState(false)
    const [cancelling, setCancelling] = useState(false)
    const [copied, setCopied] = useState<string | null>(null)

    const walletSigner = useMemo<WalletSignerLike | null>(() => {
        if (!currentAccount) return null
        return {
            address: currentAccount.address,
            signAndExecuteTransaction: ({ transaction }) => signAndExecuteTx({ transaction }),
            signPersonalMessage: ({ message }) => signPersonalMsg({ message }),
        }
    }, [currentAccount, signAndExecuteTx, signPersonalMsg])

    const selected = namespaces.find((row) => row.id === selectedId) ?? namespaces[0] ?? null
    const lifecycleBusy = creating || finishing || cancelling

    useEffect(() => {
        if (!selectedId && namespaces[0]) setSelectedId(namespaces[0].id)
        if (selectedId && !namespaces.some((row) => row.id === selectedId) && namespaces[0]) {
            setSelectedId(namespaces[0].id)
        }
    }, [namespaces, selectedId])

    const copyId = useCallback(async (id: string) => {
        await navigator.clipboard.writeText(id)
        setCopied(id)
        window.setTimeout(() => setCopied(null), 2000)
    }, [])

    const grantWritersAndDelegate = useCallback(async (
        namespaceId: string,
        setPhase: (next: string) => void,
    ) => {
        if (!walletSigner || !v2AccountId || !owner) return
        let delegateAddress: string | null = null
        if (delegatePublicKey) {
            try {
                delegateAddress = suiAddressFromEd25519PublicKeyHex(delegatePublicKey)
            } catch {
                delegateAddress = null
            }
        }
        const principals = principalsToGrant(config.v2WriterAddresses, delegateAddress, owner)
        for (const [index, principal] of principals.entries()) {
            setPhase(`Granting read/write (${index + 1}/${principals.length})`)
            const bits: GrantBits = { canRead: true, canWrite: true, canShare: false }
            await grantV2NamespaceAccess({
                suiClient,
                walletSigner,
                accountId: v2AccountId,
                namespaceId,
                principal,
                bits,
            })
        }
    }, [walletSigner, v2AccountId, owner, delegatePublicKey, suiClient])

    const initializeAndGrant = useCallback(async (
        namespaceId: string,
        setPhase: (next: string) => void,
    ) => {
        if (!walletSigner || !v2AccountId) return
        setPhase('Wrapping namespace key')
        const wrappedDek = await generateAndWrapNamespaceDek({
            suiClient,
            namespaceId,
        })
        setPhase('Initializing key')
        await initializeV2NamespaceKey({
            suiClient,
            walletSigner,
            accountId: v2AccountId,
            namespaceId,
            wrappedDek,
        })
        await grantWritersAndDelegate(namespaceId, setPhase)
        const live = await readV2NamespaceRow(suiClient, namespaceId, owner)
        if (live) {
            upsertNamespace(live)
            return
        }
        upsertNamespace({
            id: namespaceId,
            label: '',
            active: true,
            keyVersion: 0,
            keyInitialized: true,
            destroyed: false,
            owner,
            accountId: v2AccountId,
        })
    }, [
        walletSigner,
        v2AccountId,
        suiClient,
        grantWritersAndDelegate,
        owner,
        upsertNamespace,
    ])

    const handleCreate = useCallback(async () => {
        if (!walletSigner || !owner) return
        if (!v2ConfigReady()) {
            setCreateError('V2 package IDs are not configured')
            return
        }
        if (!v2AccountId) {
            setCreateError('No V2 Walrus Memory account found for this wallet')
            return
        }
        const label = normalizeLabelForSubmit(newLabel)
        const invalid = validateNamespaceLabel(label)
        if (invalid) {
            setCreateError(invalid)
            return
        }

        setCreating(true)
        setCreateError('')
        let phase = ''
        const setPhase = (next: string) => {
            phase = next
            setCreatePhase(next)
        }
        try {
            setPhase('Creating namespace')
            const created = await createV2Namespace({
                suiClient,
                walletSigner,
                accountId: v2AccountId,
                label,
            })
            const createdRow = await readV2NamespaceRow(suiClient, created.namespaceId, owner)
            upsertNamespace(createdRow ?? {
                id: created.namespaceId,
                label,
                active: false,
                keyVersion: 0,
                keyInitialized: false,
                destroyed: false,
                owner,
                accountId: v2AccountId,
            })
            setSelectedId(created.namespaceId)

            await initializeAndGrant(created.namespaceId, setPhase)

            setShowCreate(false)
            setNewLabel('memories')
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            setCreateError(phase ? `${phase} failed: ${message}` : message)
        } finally {
            setCreatePhase('')
            setCreating(false)
            await refresh()
        }
    }, [
        walletSigner,
        owner,
        v2AccountId,
        newLabel,
        suiClient,
        upsertNamespace,
        initializeAndGrant,
        refresh,
    ])

    const handleFinishInitialize = useCallback(async () => {
        if (!walletSigner || !selected || selected.keyInitialized || !v2AccountId) return
        setFinishing(true)
        setCreateError('')
        let phase = ''
        const setPhase = (next: string) => {
            phase = next
            setCreatePhase(next)
        }
        try {
            await initializeAndGrant(selected.id, setPhase)
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            setCreateError(phase ? `${phase} failed: ${message}` : message)
        } finally {
            setCreatePhase('')
            setFinishing(false)
            await refresh()
        }
    }, [walletSigner, selected, v2AccountId, initializeAndGrant, refresh])

    const handleCancelReservation = useCallback(async () => {
        if (!walletSigner || !selected || selected.keyInitialized || !v2AccountId) return
        setCancelling(true)
        setCreateError('')
        setCreatePhase('Cancelling reservation')
        try {
            await cancelV2UninitializedNamespace({
                suiClient,
                walletSigner,
                accountId: v2AccountId,
                namespaceId: selected.id,
            })
            removeNamespace(selected.id)
            setSelectedId(null)
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            setCreateError(`Cancelling reservation failed: ${message}`)
        } finally {
            setCreatePhase('')
            setCancelling(false)
            await refresh()
        }
    }, [walletSigner, selected, v2AccountId, suiClient, removeNamespace, refresh])

    if (!config.v2NamespacesEnabled) return null

    const listBusy = loading && namespaces.length === 0

    return (
        <Card
            className="dashboard-keys-card"
            title="Namespaces"
            subtitle="V2 namespaces owned by this wallet. Relayer remember/recall use the label."
            action={
                <div className="card-header-actions">
                    <button
                        className="btn btn-secondary btn-sm dashboard-keys-refresh"
                        onClick={() => void refresh()}
                        disabled={loading || previewMode}
                        aria-busy={loading}
                    >
                        <RefreshCw size={12} /> Refresh
                    </button>
                    <button
                        className="lp-nav-cta dashboard-keys-add"
                        onClick={() => {
                            setCreateError('')
                            setShowCreate(true)
                        }}
                        disabled={showCreate || lifecycleBusy || previewMode || !v2AccountId || Boolean(config.sealServerConfigsError)}
                    >
                        Create <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                    </button>
                </div>
            }
        >
            {(error || createError || config.sealServerConfigsError) && (
                <div style={{
                    background: 'rgba(248,113,113,0.08)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    marginBottom: 12,
                    color: 'var(--danger)',
                    fontSize: '0.82rem',
                }}>
                    {createError || error || config.sealServerConfigsError}
                </div>
            )}
            {createPhase && (
                <p className="dashboard-add-key-note">{createPhase}…</p>
            )}

            {showCreate && (
                <div className="dashboard-add-key-form">
                    <div className="dashboard-add-key-field">
                        <label className="dashboard-add-key-label">Namespace label</label>
                        <input
                            className="dashboard-add-key-input"
                            type="text"
                            value={newLabel}
                            maxLength={NAMESPACE_LABEL_MAX_LENGTH}
                            onChange={(event) => setNewLabel(sanitizeLabelInput(event.target.value))}
                            placeholder="memories"
                        />
                    </div>
                    <p className="dashboard-add-key-note">
                        Creates the namespace, Seal-wraps its key, and grants this session&apos;s agent Read+Write. Separate sponsored transactions.
                    </p>
                    <div className="dashboard-add-key-actions">
                        <button
                            className="btn btn-secondary btn-sm dashboard-add-key-cancel"
                            onClick={() => setShowCreate(false)}
                            disabled={lifecycleBusy}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary btn-sm dashboard-add-key-create"
                            onClick={() => void handleCreate()}
                            disabled={lifecycleBusy || !v2AccountId || !walletSigner}
                            aria-busy={creating}
                        >
                            {creating ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </div>
            )}

            {listBusy ? (
                <div className="dashboard-empty-message dashboard-empty-message--account">
                    Loading namespaces...
                </div>
            ) : !v2ConfigReady() ? (
                <div className="dashboard-empty-message dashboard-empty-message--account">
                    V2 package IDs are not configured.
                </div>
            ) : !v2AccountId && !loading ? (
                <div className="dashboard-empty-message dashboard-empty-message--account">
                    No V2 Walrus Memory account found for this wallet. Namespaces require a MemWal account on the V2 package.
                </div>
            ) : namespaces.length === 0 ? (
                <div className="dashboard-empty-message dashboard-empty-message--account">
                    No namespaces yet. Create one to isolate V2 memories under a Seal-wrapped key.
                </div>
            ) : (
                <div className={`dashboard-key-table-wrap${loading ? ' dashboard-key-list--busy' : ''}`}>
                    <table className="dashboard-key-table">
                        <thead>
                            <tr>
                                <th scope="col">Label</th>
                                <th scope="col">Object ID</th>
                                <th scope="col">Active</th>
                                <th scope="col">Key version</th>
                                <th scope="col" className="dashboard-key-table-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {namespaces.map((row) => {
                                const isSelected = selected?.id === row.id && !row.keyInitialized
                                return (
                                    <tr
                                        key={row.id}
                                        className={`dashboard-key-row${isSelected ? ' dashboard-key-row--selected' : ''}`}
                                        onClick={() => setSelectedId(row.id)}
                                    >
                                        <td data-label="Label">
                                            <div className="dashboard-key-name">
                                                <span>{row.label || 'Untitled'}</span>
                                            </div>
                                        </td>
                                        <td data-label="Object ID">
                                            <code className="dashboard-key-public" title={row.id}>
                                                {compactObjectId(row.id)}
                                            </code>
                                        </td>
                                        <td data-label="Active">
                                            {row.active ? 'active' : row.keyInitialized ? 'inactive' : 'uninitialized'}
                                        </td>
                                        <td data-label="Key version">{row.keyVersion}</td>
                                        <td data-label="Actions" className="dashboard-key-row-actions">
                                            <button
                                                className={`btn btn-secondary btn-sm dashboard-key-icon-action${copied === row.id ? ' dashboard-key-icon-action--copied' : ''}`}
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    void copyId(row.id)
                                                }}
                                                aria-label={copied === row.id ? 'Object id copied' : 'Copy object id'}
                                                title={copied === row.id ? 'Copied' : 'Copy object id'}
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {selected && !selected.keyInitialized && (
                <div className="dashboard-add-key-form" style={{ marginTop: 20 }}>
                    <p className="dashboard-add-key-note">
                        This namespace is reserved but not initialized. Finish wrapping the key, or cancel the reservation to reuse the label.
                    </p>
                    <div className="dashboard-add-key-actions">
                        <button
                            className="btn btn-secondary btn-sm dashboard-add-key-cancel"
                            onClick={() => void handleCancelReservation()}
                            disabled={lifecycleBusy || !walletSigner}
                            aria-busy={cancelling}
                        >
                            {cancelling ? 'Cancelling...' : 'Cancel reservation'}
                        </button>
                        <button
                            className="btn btn-primary btn-sm dashboard-add-key-create"
                            onClick={() => void handleFinishInitialize()}
                            disabled={lifecycleBusy || !walletSigner}
                            aria-busy={finishing}
                        >
                            {finishing ? 'Initializing...' : 'Finish initialize'}
                        </button>
                    </div>
                </div>
            )}
        </Card>
    )
}
