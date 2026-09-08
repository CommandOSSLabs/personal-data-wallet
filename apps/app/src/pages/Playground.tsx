/**
 * Playground — Interactive Demo Showcase
 *
 * Shows code for each Walrus Memory SDK operation, with a "Run" button
 * that executes the call against a live server using the real SDK.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, LogOut } from 'lucide-react'
import {
    useCurrentAccount,
    useDisconnectWallet,
    useSignPersonalMessage,
    useSuiClient,
} from '@mysten/dapp-kit'
import { useSponsoredTransaction } from '../hooks/useSponsoredTransaction'
import { MemWal } from '@mysten-incubation/memwal'
import type { RememberJobStatus } from '@mysten-incubation/memwal'
import { MemWalManual } from '@mysten-incubation/memwal/manual'
import { useDelegateKey } from '../App'
import { PlaygroundStep } from '../components/PlaygroundStep'
import { config } from '../config'
import { useV2Namespaces } from '../hooks/useV2Namespaces'
import { getAnalyticsErrorType, trackEvent } from '../utils/analytics'
import { playgroundMemwalAccountId, playgroundNamespaceOptions } from '../utils/v2Namespace'

function trackPlaygroundOperation(
    operation: string,
    status: 'start' | 'complete' | 'failed',
    params: Record<string, string | number | boolean> = {},
) {
    trackEvent(`playground_operation_${status}`, {
        operation,
        ...params,
    })
}

// ============================================================
// Playground Page
// ============================================================

export default function Playground() {
    const currentAccount = useCurrentAccount()
    const { mutateAsync: disconnect } = useDisconnectWallet()
    const { delegateKey, clearDelegateKeys, accountObjectId } = useDelegateKey()

    const address = currentAccount?.address || ''
    const serverUrl = config.memwalServerUrl
    const keyStatus = delegateKey ? 'configured' : 'missing'

    // Wallet signing hooks (for full client-side mode)
    const { mutateAsync: signAndExecuteTransaction } = useSponsoredTransaction()
    const { mutateAsync: signPersonalMessage } = useSignPersonalMessage()
    const suiClient = useSuiClient()

    // ============================================================
    // SDK Instance — created from delegate key
    // ============================================================

    const [namespace, setNamespace] = useState('default')
    const { namespaces: v2Namespaces, v2AccountId } = useV2Namespaces(
        config.v2NamespacesEnabled ? address : '',
    )
    const v2NamespaceLabels = useMemo(
        () => v2Namespaces.filter((row) => row.active && row.label).map((row) => row.label),
        [v2Namespaces],
    )
    const namespaceSelectOptions = useMemo(
        () => playgroundNamespaceOptions(v2NamespaceLabels, namespace),
        [v2NamespaceLabels, namespace],
    )
    const showV2NamespaceSelect = config.v2NamespacesEnabled && v2NamespaceLabels.length > 0
    const autoSelectedV2Namespace = useRef(false)
    useEffect(() => {
        if (autoSelectedV2Namespace.current) return
        const first = v2NamespaceLabels[0]
        if (!first) return
        autoSelectedV2Namespace.current = true
        setNamespace(first)
    }, [v2NamespaceLabels])
    const memwalAccountId = playgroundMemwalAccountId({
        namespace,
        v2Namespaces,
        v2AccountId,
        v1AccountId: accountObjectId,
    })

    const memwal = useMemo(() => {
        if (!delegateKey || !memwalAccountId) return null
        return MemWal.create({
            key: delegateKey,
            accountId: memwalAccountId,
            serverUrl,
            namespace: namespace || undefined,
        })
    }, [delegateKey, memwalAccountId, serverUrl, namespace])

    // Step states

    const [healthResult, setHealthResult] = useState<string | null>(null)
    const [healthError, setHealthError] = useState<string | null>(null)
    const [healthLoading, setHealthLoading] = useState(false)

    const [openStep, setOpenStep] = useState<string | null>('remember')
    const toggleStep = useCallback((id: string) => {
        setOpenStep((current) => (current === id ? null : id))
    }, [])

    const [rememberText, setRememberText] = useState(
        "I'm a software engineer living in Ho Chi Minh City. I love Vietnamese coffee and coding in Rust.",
    )
    const [rememberPinArtifactId, setRememberPinArtifactId] = useState('')
    const [rememberResult, setRememberResult] = useState<string | null>(null)
    const [rememberError, setRememberError] = useState<string | null>(null)
    const [rememberLoading, setRememberLoading] = useState(false)

    const [artifactFile, setArtifactFile] = useState<File | null>(null)
    const [artifactResult, setArtifactResult] = useState<string | null>(null)
    const [artifactError, setArtifactError] = useState<string | null>(null)
    const [artifactLoading, setArtifactLoading] = useState(false)
    const [lastArtifactId, setLastArtifactId] = useState('')

    const [artifactListResult, setArtifactListResult] = useState<string | null>(null)
    const [artifactListError, setArtifactListError] = useState<string | null>(null)
    const [artifactListLoading, setArtifactListLoading] = useState(false)

    const [getArtifactId, setGetArtifactId] = useState('')
    const [getArtifactResult, setGetArtifactResult] = useState<string | null>(null)
    const [getArtifactError, setGetArtifactError] = useState<string | null>(null)
    const [getArtifactLoading, setGetArtifactLoading] = useState(false)
    const [downloadedArtifactUrl, setDownloadedArtifactUrl] = useState<string | null>(null)
    const [downloadedArtifactName, setDownloadedArtifactName] = useState('artifact.bin')

    const [recallQuery, setRecallQuery] = useState('Where does the user live?')
    const [recallResult, setRecallResult] = useState<string | null>(null)
    const [recallError, setRecallError] = useState<string | null>(null)
    const [recallLoading, setRecallLoading] = useState(false)

    const [analyzeText, setAnalyzeText] = useState(
        "I prefer dark mode in all my apps. My favorite programming language is Rust. I'm allergic to shellfish.",
    )
    const [analyzeResult, setAnalyzeResult] = useState<string | null>(null)
    const [analyzeError, setAnalyzeError] = useState<string | null>(null)
    const [analyzeLoading, setAnalyzeLoading] = useState(false)

    const [askQuestion, setAskQuestion] = useState('What do you know about me?')
    const [askLlmKey, setAskLlmKey] = useState('')
    const [askLlmProvider, setAskLlmProvider] = useState<'openai' | 'openrouter'>('openai')
    const [askResult, setAskResult] = useState<{ answer: string; memories: { text: string; distance: number; blob_id?: string }[]; systemPrompt: string } | null>(null)
    const [askError, setAskError] = useState<string | null>(null)
    const [askLoading, setAskLoading] = useState(false)
    const [askPhase, setAskPhase] = useState('')

    // Full client-side mode states
    const [fullRememberText, setFullRememberText] = useState(
        "I enjoy hiking in the mountains on weekends and my favorite trail is in Dalat."
    )
    const [fullRememberResult, setFullRememberResult] = useState<string | null>(null)
    const [fullRememberError, setFullRememberError] = useState<string | null>(null)
    const [fullRememberLoading, setFullRememberLoading] = useState(false)
    const [fullRememberPhase, setFullRememberPhase] = useState('')

    const [fullRecallQuery, setFullRecallQuery] = useState('outdoor activities')
    const [fullRecallResult, setFullRecallResult] = useState<string | null>(null)
    const [fullRecallError, setFullRecallError] = useState<string | null>(null)
    const [fullRecallLoading, setFullRecallLoading] = useState(false)
    const [fullRecallPhase, setFullRecallPhase] = useState('')

    const [restoreResult, setRestoreResult] = useState<string | null>(null)
    const [restoreError, setRestoreError] = useState<string | null>(null)
    const [restoreLoading, setRestoreLoading] = useState(false)


    const handleLogout = useCallback(async () => {
        trackEvent('sign_out', { location: 'playground' })
        clearDelegateKeys()
        await disconnect()
    }, [clearDelegateKeys, disconnect])

    // ---- Handlers (using SDK) ----

    const runHealth = useCallback(async () => {
        if (!memwal) return
        trackPlaygroundOperation('health', 'start')
        setHealthLoading(true)
        setHealthResult(null)
        setHealthError(null)
        try {
            const data = await memwal.health()
            setHealthResult(JSON.stringify(data, null, 2))
            trackPlaygroundOperation('health', 'complete')
        } catch (err: unknown) {
            setHealthError(err instanceof Error ? err.message : String(err))
            trackPlaygroundOperation('health', 'failed', { error_type: getAnalyticsErrorType(err) })
        } finally {
            setHealthLoading(false)
        }
    }, [memwal])

    const runRemember = useCallback(async () => {
        if (!memwal) return
        if (config.v2NamespacesEnabled && (namespace === 'default' || v2NamespaceLabels.length === 0)) {
            setRememberError(
                v2NamespaceLabels.length === 0
                    ? 'V2 is on: create a namespace on the dashboard first (Namespaces → Create), then pick it here. `default` is the old V1 Walrus path.'
                    : 'V2 is on: pick a V2 namespace in the dropdown. `default` uploads to Walrus, not Oyster.',
            )
            return
        }
        trackPlaygroundOperation('remember', 'start')
        setRememberLoading(true)
        setRememberResult(null)
        setRememberError(null)
        const t0 = Date.now()
        const elapsed = () => ((Date.now() - t0) / 1000).toFixed(1)

        try {
            // Stage 1 — fire-and-accept. The relayer returns 202 with
            // {job_id, status: "running"} as soon as the work is enqueued.
            // Show this immediately so the user can see the async-job
            // pattern (the playground's whole value prop).
            const accepted = await memwal.rememberAsync(rememberText, {
                sourceArtifactId: rememberPinArtifactId.trim() || undefined,
            })
            const acceptedBlock =
                `// 1. accepted (HTTP 202) at T+${elapsed()}s\n` +
                JSON.stringify(accepted, null, 2)

            // Stage 2 — drive our own polling loop instead of letting
            // waitForRememberJob block to terminal. That way each
            // intermediate state (pending → running → uploaded → done)
            // surfaces to the UI as it happens, not just the final
            // value. Server-side state machine: routes.rs writes
            // status='running' on accept, jobs.rs flips to 'uploaded'
            // after the store write (Oyster for V2, Walrus for V1),
            // then 'done' once the fence + blob_id is committed.
            const TIMEOUT_MS = 90_000
            const POLL_MS = 1500
            const deadline = Date.now() + TIMEOUT_MS

            let lastStatus = accepted.status
            const transitions: Array<{ status: string; tSec: string }> = [
                { status: accepted.status, tSec: '0.0' },
            ]

            const renderProgress = (current: RememberJobStatus | null) => {
                const ladder = transitions
                    .map((t) => `//   [${t.tSec}s] ${t.status}`)
                    .join('\n')
                const tail = current
                    ? JSON.stringify(current, null, 2)
                    : '// (polling...)'
                setRememberResult(
                    `${acceptedBlock}\n\n` +
                        `// 2. polling /api/remember/${accepted.job_id} ` +
                        `every ${POLL_MS}ms (max ${TIMEOUT_MS / 1000}s)\n` +
                        `${ladder}\n\n` +
                        `// current (T+${elapsed()}s)\n${tail}`
                )
            }
            renderProgress(null)

            // Polling loop. await-in-loop is intentional — we want strict
            // serial requests so we don't pile up retries when the server
            // is briefly slow.
            let terminal: RememberJobStatus | null = null
            while (Date.now() < deadline && !terminal) {
                await new Promise((r) => setTimeout(r, POLL_MS))
                const current = await memwal.getRememberStatus(
                    accepted.job_id
                )
                if (current.status !== lastStatus) {
                    transitions.push({
                        status: current.status,
                        tSec: elapsed(),
                    })
                    lastStatus = current.status
                }
                renderProgress(current)

                if (
                    current.status === 'done' ||
                    current.status === 'failed' ||
                    current.status === 'not_found'
                ) {
                    terminal = current
                }
            }

            if (!terminal) {
                throw Object.assign(
                    new Error(
                        `remember job timed out after ${TIMEOUT_MS / 1000}s ` +
                            `(job_id=${accepted.job_id})`
                    ),
                    { jobId: accepted.job_id }
                )
            }

            if (terminal.status === 'failed') {
                throw Object.assign(
                    new Error(
                        `remember job failed: ${terminal.error ?? 'unknown error'}`
                    ),
                    { jobId: accepted.job_id }
                )
            }
            if (terminal.status === 'not_found') {
                throw Object.assign(
                    new Error(
                        `remember job not_found (job_id=${accepted.job_id})`
                    ),
                    { jobId: accepted.job_id }
                )
            }

            // terminal.status === 'done'
            const ladder = transitions
                .map((t) => `//   [${t.tSec}s] ${t.status}`)
                .join('\n')
            setRememberResult(
                `${acceptedBlock}\n\n` +
                    `// 2. state machine traversal\n${ladder}\n\n` +
                    `// 3. terminal at T+${elapsed()}s\n` +
                    JSON.stringify(terminal, null, 2)
            )
            trackPlaygroundOperation('remember', 'complete')
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            const jobId = (err as { jobId?: string } | null)?.jobId
            if (jobId && /timed out/i.test(msg)) {
                setRememberError(
                    `${msg}\n\n` +
                        `The job is still running on the server — re-run this ` +
                        `step or query \`GET /api/remember/${jobId}\` ` +
                        `directly to check its state.`
                )
            } else {
                setRememberError(msg)
            }
            trackPlaygroundOperation('remember', 'failed', { error_type: getAnalyticsErrorType(err) })
        } finally {
            setRememberLoading(false)
        }
    }, [memwal, rememberText, rememberPinArtifactId, namespace, v2NamespaceLabels.length])

    const requireV2Namespace = useCallback(() => {
        if (config.v2NamespacesEnabled && (namespace === 'default' || v2NamespaceLabels.length === 0)) {
            return v2NamespaceLabels.length === 0
                ? 'V2 is on: create a namespace on the dashboard first, then pick it here.'
                : 'V2 is on: pick a V2 namespace. Artifacts are not stored on `default`.'
        }
        return null
    }, [namespace, v2NamespaceLabels.length])

    const runStoreArtifact = useCallback(async () => {
        if (!memwal) return
        const v2Error = requireV2Namespace()
        if (v2Error) {
            setArtifactError(v2Error)
            return
        }
        if (!artifactFile) {
            setArtifactError('Choose a file first.')
            return
        }
        trackPlaygroundOperation('store_artifact', 'start')
        setArtifactLoading(true)
        setArtifactResult(null)
        setArtifactError(null)
        try {
            const accepted = await memwal.captureAttachment(artifactFile)
            const terminal = await memwal.waitForArtifact(accepted.artifact_id)
            if (terminal.status !== 'done') {
                throw new Error(terminal.error ?? `artifact ${terminal.status}`)
            }
            setLastArtifactId(terminal.artifact_id)
            setGetArtifactId(terminal.artifact_id)
            setRememberPinArtifactId(terminal.artifact_id)
            setArtifactResult(JSON.stringify({
                accepted,
                stored: {
                    artifact_id: terminal.artifact_id,
                    filename: terminal.filename,
                    mime_type: terminal.mime_type,
                    byte_size: terminal.byte_size,
                    blob_id: terminal.blob_id,
                    storage_mode: terminal.storage_mode,
                    source: terminal.source,
                    status: terminal.status,
                },
            }, null, 2))
            trackPlaygroundOperation('store_artifact', 'complete')
        } catch (err: unknown) {
            setArtifactError(err instanceof Error ? err.message : String(err))
            trackPlaygroundOperation('store_artifact', 'failed', { error_type: getAnalyticsErrorType(err) })
        } finally {
            setArtifactLoading(false)
        }
    }, [memwal, artifactFile, requireV2Namespace])

    const runListArtifacts = useCallback(async () => {
        if (!memwal) return
        trackPlaygroundOperation('list_artifacts', 'start')
        setArtifactListLoading(true)
        setArtifactListResult(null)
        setArtifactListError(null)
        try {
            const data = await memwal.listArtifacts()
            setArtifactListResult(JSON.stringify(data, null, 2))
            trackPlaygroundOperation('list_artifacts', 'complete')
        } catch (err: unknown) {
            setArtifactListError(err instanceof Error ? err.message : String(err))
            trackPlaygroundOperation('list_artifacts', 'failed', { error_type: getAnalyticsErrorType(err) })
        } finally {
            setArtifactListLoading(false)
        }
    }, [memwal])

    const runGetArtifact = useCallback(async () => {
        if (!memwal) return
        const id = getArtifactId.trim()
        if (!id) {
            setGetArtifactError('Paste an artifact id from store or list.')
            return
        }
        trackPlaygroundOperation('get_artifact', 'start')
        setGetArtifactLoading(true)
        setGetArtifactResult(null)
        setGetArtifactError(null)
        if (downloadedArtifactUrl) URL.revokeObjectURL(downloadedArtifactUrl)
        setDownloadedArtifactUrl(null)
        try {
            const data = await memwal.getArtifact(id)
            const { bytes, bytes_b64, ...meta } = data
            setGetArtifactResult(JSON.stringify({
                ...meta,
                bytes_b64: bytes_b64 ? `<${bytes_b64.length} chars>` : undefined,
                bytes: bytes ? `<${bytes.byteLength} bytes>` : undefined,
            }, null, 2))
            if (bytes && bytes.byteLength > 0) {
                const blob = new Blob([new Uint8Array(bytes)], { type: data.mime_type || 'application/octet-stream' })
                setDownloadedArtifactUrl(URL.createObjectURL(blob))
                setDownloadedArtifactName(data.filename || 'artifact.bin')
            }
            trackPlaygroundOperation('get_artifact', 'complete')
        } catch (err: unknown) {
            setGetArtifactError(err instanceof Error ? err.message : String(err))
            trackPlaygroundOperation('get_artifact', 'failed', { error_type: getAnalyticsErrorType(err) })
        } finally {
            setGetArtifactLoading(false)
        }
    }, [memwal, getArtifactId, downloadedArtifactUrl])

    const runRecall = useCallback(async () => {
        if (!memwal) return
        trackPlaygroundOperation('recall', 'start')
        setRecallLoading(true)
        setRecallResult(null)
        setRecallError(null)
        try {
            const data = await memwal.recall(recallQuery, 5)
            setRecallResult(JSON.stringify(data, null, 2))
            trackPlaygroundOperation('recall', 'complete')
        } catch (err: unknown) {
            setRecallError(err instanceof Error ? err.message : String(err))
            trackPlaygroundOperation('recall', 'failed', { error_type: getAnalyticsErrorType(err) })
        } finally {
            setRecallLoading(false)
        }
    }, [memwal, recallQuery])

    const runAnalyze = useCallback(async () => {
        if (!memwal) return
        trackPlaygroundOperation('analyze', 'start')
        setAnalyzeLoading(true)
        setAnalyzeResult(null)
        setAnalyzeError(null)
        try {
            const data = await memwal.analyze(analyzeText)
            setAnalyzeResult(JSON.stringify(data, null, 2))
            trackPlaygroundOperation('analyze', 'complete')
        } catch (err: unknown) {
            setAnalyzeError(err instanceof Error ? err.message : String(err))
            trackPlaygroundOperation('analyze', 'failed', { error_type: getAnalyticsErrorType(err) })
        } finally {
            setAnalyzeLoading(false)
        }
    }, [memwal, analyzeText])

    const runRestore = useCallback(async () => {
        if (!memwal) return
        trackPlaygroundOperation('restore', 'start')
        setRestoreLoading(true)
        setRestoreResult(null)
        setRestoreError(null)
        try {
            const data = await memwal.restore(namespace || 'default')
            setRestoreResult(JSON.stringify(data, null, 2))
            trackPlaygroundOperation('restore', 'complete')
        } catch (err: unknown) {
            setRestoreError(err instanceof Error ? err.message : String(err))
            trackPlaygroundOperation('restore', 'failed', { error_type: getAnalyticsErrorType(err) })
        } finally {
            setRestoreLoading(false)
        }
    }, [memwal, namespace])

    const runAsk = useCallback(async () => {
        if (!memwal) return
        if (!askLlmKey.trim()) {
            setAskError('Please enter your LLM API key (OpenAI or OpenRouter)')
            trackPlaygroundOperation('ask_ai', 'failed', { error_type: 'missing_llm_key' })
            return
        }
        trackPlaygroundOperation('ask_ai', 'start', { llm_provider: askLlmProvider })
        setAskLoading(true)
        setAskResult(null)
        setAskError(null)

        try {
            // Phase 1: Recall memories using SDK
            setAskPhase('step 1/3 — recalling memories from Walrus Memory...')
            const recallData = await memwal.recall(askQuestion, 5)
            const memories = recallData.results || []

            // Phase 2: Build prompt with memory context
            setAskPhase(`step 2/3 — injecting ${memories.length} memories into prompt...`)
            const memoryContext = memories.length > 0
                ? `The following are known facts about this user (from encrypted Walrus storage):\n${memories.map((m) => `- ${m.text} (relevance: ${(((1 - m.distance) * 100)).toFixed(0)}%)`).join('\n')}`
                : 'No memories found for this user yet.'

            const systemPrompt = `You are a helpful AI assistant. The user has a personal memory store powered by Walrus Memory (encrypted, stored on Walrus blockchain).\n\n${memoryContext}\n\nUse the above context to provide personalized answers. If the memories don't contain relevant information, say so honestly.`

            // Phase 3: Call user's own LLM
            setAskPhase('step 3/3 — calling your LLM with enriched prompt...')
            const llmBase = askLlmProvider === 'openrouter'
                ? 'https://openrouter.ai/api/v1'
                : 'https://api.openai.com/v1'
            const model = askLlmProvider === 'openrouter'
                ? 'openai/gpt-4o-mini'
                : 'gpt-4o-mini'

            const llmResp = await fetch(`${llmBase}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${askLlmKey.trim()}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: askQuestion },
                    ],
                    temperature: 0.7,
                }),
            })

            if (!llmResp.ok) {
                const errText = await llmResp.text()
                throw new Error(`LLM API error (${llmResp.status}): ${errText}`)
            }

            const llmData = await llmResp.json()
            const answer = llmData.choices?.[0]?.message?.content?.trim() || 'No response'

            setAskPhase('')
            setAskResult({ answer, memories, systemPrompt })
            trackPlaygroundOperation('ask_ai', 'complete', {
                llm_provider: askLlmProvider,
                memories_count: memories.length,
            })
        } catch (err: unknown) {
            setAskPhase('')
            setAskError(err instanceof Error ? err.message : String(err))
            trackPlaygroundOperation('ask_ai', 'failed', {
                llm_provider: askLlmProvider,
                error_type: getAnalyticsErrorType(err),
            })
        } finally {
            setAskLoading(false)
        }
    }, [memwal, askQuestion, askLlmKey, askLlmProvider])

    // ---- Full Client-Side Mode (MemWalManual) ----

    const memwalManual = useMemo(() => {
        if (!delegateKey || !address || !askLlmKey.trim()) return null
        try {
            const embeddingApiBase = askLlmProvider === 'openrouter'
                ? 'https://openrouter.ai/api/v1'
                : 'https://api.openai.com/v1'
            return MemWalManual.create({
                key: delegateKey,
                serverUrl,
                walletSigner: {
                    address,
                    signAndExecuteTransaction: (input) => signAndExecuteTransaction({ transaction: input.transaction }),
                    signPersonalMessage: (input) => signPersonalMessage({ message: input.message }),
                },
                suiClient,
                embeddingApiKey: askLlmKey.trim(),
                embeddingApiBase,
                packageId: config.memwalPackageId,
                accountId: accountObjectId || '',
                registryId: config.memwalRegistryId,
                suiNetwork: config.suiNetwork,
                ...(config.sealKeyServers.length > 0 ? { sealKeyServers: [...config.sealKeyServers] } : {}),
            })
        } catch {
            return null
        }
    }, [delegateKey, serverUrl, address, signAndExecuteTransaction, signPersonalMessage, suiClient, askLlmKey, askLlmProvider, accountObjectId])

    const runFullRemember = useCallback(async () => {
        if (!memwalManual) return
        trackPlaygroundOperation('manual_remember', 'start', { llm_provider: askLlmProvider })
        setFullRememberLoading(true)
        setFullRememberResult(null)
        setFullRememberError(null)
        try {
            setFullRememberPhase('step 1/3 — embedding text...')
            // SDK handles: embed → SEAL encrypt → Walrus upload → register
            const data = await memwalManual.rememberManual(fullRememberText)
            setFullRememberPhase('')
            setFullRememberResult(JSON.stringify(data, null, 2))
            trackPlaygroundOperation('manual_remember', 'complete', { llm_provider: askLlmProvider })
        } catch (err: unknown) {
            setFullRememberPhase('')
            setFullRememberError(err instanceof Error ? err.message : String(err))
            trackPlaygroundOperation('manual_remember', 'failed', {
                llm_provider: askLlmProvider,
                error_type: getAnalyticsErrorType(err),
            })
        } finally {
            setFullRememberLoading(false)
        }
    }, [memwalManual, fullRememberText, askLlmProvider])

    const runFullRecall = useCallback(async () => {
        if (!memwalManual) return
        trackPlaygroundOperation('manual_recall', 'start', { llm_provider: askLlmProvider })
        setFullRecallLoading(true)
        setFullRecallResult(null)
        setFullRecallError(null)
        try {
            setFullRecallPhase('embed → search → Walrus download → SEAL decrypt (wallet popup)...')
            const data = await memwalManual.recallManual(fullRecallQuery, 5)

            setFullRecallPhase('')
            setFullRecallResult(JSON.stringify(data, null, 2))
            trackPlaygroundOperation('manual_recall', 'complete', { llm_provider: askLlmProvider })
        } catch (err: unknown) {
            setFullRecallPhase('')
            setFullRecallError(err instanceof Error ? err.message : String(err))
            trackPlaygroundOperation('manual_recall', 'failed', {
                llm_provider: askLlmProvider,
                error_type: getAnalyticsErrorType(err),
            })
        } finally {
            setFullRecallLoading(false)
        }
    }, [memwalManual, fullRecallQuery, askLlmProvider])



    // ---- Render ----

    return (
        <>
            <nav className="nav playground-nav">
                <div className="nav-inner">
                    <Link to="/" className="nav-brand">
                        <img className="nav-brand-logo" src="/walrus-memory-logo.svg" alt="Walrus Memory" />
                    </Link>
                    <div className="nav-user">
                        <Link to="/dashboard" className="demo-nav-back" aria-label="Dashboard">
                            <LayoutDashboard className="demo-nav-icon" size={18} aria-hidden="true" />
                            <span className="demo-nav-label">Dashboard</span>
                        </Link>
                        <span className="nav-address">
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                        <button
                            className="lp-nav-cta"
                            onClick={handleLogout}
                        >
                            Sign out <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container dashboard playground-dashboard">
                {/* Header */}
                <div className="dashboard-header">
                    <h2>Developer Playground</h2>
                    <p>
                        Test Walrus Memory SDK operations with your current server and credentials.
                        Click a row to expand it. Run steps against your server using <code>@mysten-incubation/memwal</code>.
                        {config.docsUrl && (
                            <> See the <a className="demo-doc-link" href={config.docsUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('outbound_link_click', { link: 'docs', location: 'playground' })}>documentation</a> for full API reference.</>
                        )}
                    </p>
                </div>

                {/* Server info */}
                <div className="demo-server-info">
                    <div className="demo-server-tag">
                        server: <span className="demo-tag-value demo-tag-value--server">{serverUrl}</span>
                    </div>
                    <div className="demo-server-tag">
                        key: <span className="demo-tag-value demo-tag-value--key">{keyStatus}</span>
                    </div>
                    <div className="demo-server-tag">
                        SDK: <span className="demo-tag-value demo-tag-value--sdk">@mysten-incubation/memwal</span>
                    </div>
                    <div className="demo-server-tag demo-server-tag--namespace">
                        <span>namespace:</span>
                        {showV2NamespaceSelect ? (
                            <select
                                className="demo-namespace-input"
                                value={namespace}
                                onChange={(e) => setNamespace(e.target.value)}
                                aria-label="Memory namespace"
                            >
                                {namespaceSelectOptions.map((label) => (
                                    <option key={label} value={label}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                className="demo-namespace-input"
                                value={namespace}
                                onChange={(e) => setNamespace(e.target.value)}
                                placeholder="default"
                                size={Math.max(namespace.length, 7)}
                            />
                        )}
                    </div>
                </div>

                <PlaygroundStep
                    id="health"
                    openId={openStep}
                    onToggle={toggleStep}
                    number={1}
                    title="health check"
                    description="verify the Walrus Memory server is running"
                    code={`import { MemWal } from "@mysten-incubation/memwal"

const memwal = MemWal.create({
  key: delegateKeyHex,
  accountId: "${(memwalAccountId ?? accountObjectId)?.slice(0, 10)}...",
  serverUrl: "${serverUrl}",
  namespace: "${namespace || 'default'}",
})

const data = await memwal.health()
// → { status: "ok", version: "0.1.0" }`}
                    onRun={runHealth}
                    result={healthResult}
                    error={healthError}
                    loading={healthLoading}
                />

                <PlaygroundStep
                    id="remember"
                    openId={openStep}
                    onToggle={toggleStep}
                    number={2}
                    title="remember"
                    description="accept a memory job → embed → encrypt → store. optionally pin to an artifact."
                    code={`const accepted = await memwal.rememberAsync(text${rememberPinArtifactId.trim() ? `, { sourceArtifactId: "${rememberPinArtifactId.trim()}" }` : ''})
// poll GET /api/remember/{job_id} until done`}
                    onRun={runRemember}
                    result={rememberResult}
                    resultLabel="memory saved (accepted → terminal)"
                    error={rememberError}
                    loading={rememberLoading}
                >
                    <div className="input-group">
                        <label>memory text:</label>
                        <textarea
                            className="input"
                            rows={3}
                            value={rememberText}
                            onChange={(e) => setRememberText(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>pin to artifact id (optional):</label>
                        <input
                            className="input"
                            value={rememberPinArtifactId}
                            onChange={(e) => setRememberPinArtifactId(e.target.value)}
                            placeholder="from store artifact"
                        />
                    </div>
                </PlaygroundStep>

                <PlaygroundStep
                    id="recall"
                    openId={openStep}
                    onToggle={toggleStep}
                    number={3}
                    title="recall"
                    description="semantic search over text memories only — artifacts are not embedded"
                    code={`const result = await memwal.recall("${recallQuery}", 5)
// namespace: "${namespace || 'default'}"`}
                    onRun={runRecall}
                    result={recallResult}
                    resultLabel="memories found (decrypted)"
                    error={recallError}
                    loading={recallLoading}
                >
                    <div className="input-group">
                        <label>search query:</label>
                        <input
                            className="input"
                            value={recallQuery}
                            onChange={(e) => setRecallQuery(e.target.value)}
                        />
                    </div>
                </PlaygroundStep>

                <PlaygroundStep
                    id="store-artifact"
                    openId={openStep}
                    onToggle={toggleStep}
                    number={4}
                    title="store artifact"
                    description="encrypt a file into the namespace. no embedding — get it back by id."
                    code={`const accepted = await memwal.captureAttachment(file)
const stored = await memwal.waitForArtifact(accepted.artifact_id)
// → { artifact_id, filename, mime_type, blob_id, storage_mode }`}
                    onRun={runStoreArtifact}
                    result={artifactResult}
                    resultLabel="artifact stored"
                    error={artifactError}
                    loading={artifactLoading}
                    highlight
                >
                    <div className="input-group">
                        <label>file:</label>
                        <input
                            className="demo-file-input"
                            type="file"
                            onChange={(e) => setArtifactFile(e.target.files?.[0] ?? null)}
                        />
                        {artifactFile && (
                            <div className="demo-file-meta">
                                {artifactFile.name} · {artifactFile.type || 'application/octet-stream'} · {artifactFile.size} bytes
                            </div>
                        )}
                    </div>
                </PlaygroundStep>

                <PlaygroundStep
                    id="list-artifacts"
                    openId={openStep}
                    onToggle={toggleStep}
                    number={5}
                    title="list artifacts"
                    description="metadata only — filenames, mime, size, status"
                    code={`const result = await memwal.listArtifacts()
// → { artifacts: [{ artifact_id, filename, mime_type, byte_size, status }] }`}
                    onRun={runListArtifacts}
                    result={artifactListResult}
                    resultLabel="artifacts"
                    error={artifactListError}
                    loading={artifactListLoading}
                />

                <PlaygroundStep
                    id="get-artifact"
                    openId={openStep}
                    onToggle={toggleStep}
                    number={6}
                    title="get artifact"
                    description="decrypt and download the original file"
                    code={`const artifact = await memwal.getArtifact("${getArtifactId || 'artifact-id'}")
// artifact.bytes is a Uint8Array when status is done`}
                    onRun={runGetArtifact}
                    result={getArtifactResult}
                    resultLabel="artifact"
                    error={getArtifactError}
                    loading={getArtifactLoading}
                >
                    <div className="input-group">
                        <label>artifact id:</label>
                        <input
                            className="input"
                            value={getArtifactId}
                            onChange={(e) => setGetArtifactId(e.target.value)}
                            placeholder={lastArtifactId || 'uuid from store / list'}
                        />
                    </div>
                    {downloadedArtifactUrl && (
                        <a className="btn btn-primary btn-sm" href={downloadedArtifactUrl} download={downloadedArtifactName}>
                            Download {downloadedArtifactName}
                        </a>
                    )}
                </PlaygroundStep>

                <PlaygroundStep
                    id="analyze"
                    openId={openStep}
                    onToggle={toggleStep}
                    number={7}
                    title="analyze"
                    description="LLM extracts facts → memory jobs. V2 namespaces still reject this path."
                    code={`const result = await memwal.analyze(
  "${analyzeText.slice(0, 50)}..."${rememberPinArtifactId.trim() ? `, { sourceArtifactId: "${rememberPinArtifactId.trim()}" }` : ''}
)`}
                    onRun={runAnalyze}
                    result={analyzeResult}
                    resultLabel="fact jobs accepted"
                    error={analyzeError}
                    loading={analyzeLoading}
                >
                    <div className="input-group">
                        <label>conversation text to analyze:</label>
                        <textarea
                            className="input"
                            rows={3}
                            value={analyzeText}
                            onChange={(e) => setAnalyzeText(e.target.value)}
                        />
                    </div>
                </PlaygroundStep>

                <PlaygroundStep
                    id="restore"
                    openId={openStep}
                    onToggle={toggleStep}
                    number={8}
                    title="restore"
                    description={config.v2NamespacesEnabled
                        ? "re-index memories from Oyster (V2) or Walrus (V1) → rebuild local DB"
                        : "re-index all memories from Walrus → rebuild local DB"}
                    code={config.v2NamespacesEnabled
                        ? `const result = await memwal.restore("${namespace || 'memories'}")`
                        : `const result = await memwal.restore("${namespace || 'default'}")`}
                    onRun={runRestore}
                    result={restoreResult}
                    resultLabel="restore result"
                    error={restoreError}
                    loading={restoreLoading}
                    highlight
                />

                <PlaygroundStep
                    id="llm"
                    openId={openStep}
                    onToggle={toggleStep}
                    number={9}
                    title="configure your LLM"
                    description="Walrus Memory is just the memory layer — you bring your own LLM"
                    hideRun
                    highlight={Boolean(askLlmKey.trim())}
                    code={`// your key stays in this tab — never sent to Walrus Memory.`}
                >
                    <div className="demo-info-panel">
                        <div className="demo-info-label">
                            your LLM API key (not stored, client-side only)
                        </div>
                        <div className="demo-llm-controls">
                            <select
                                className="input"
                                value={askLlmProvider}
                                onChange={(e) => setAskLlmProvider(e.target.value as 'openai' | 'openrouter')}
                            >
                                <option value="openai">OpenAI</option>
                                <option value="openrouter">OpenRouter</option>
                            </select>
                            <input
                                className="input"
                                type="password"
                                value={askLlmKey}
                                onChange={(e) => setAskLlmKey(e.target.value)}
                                placeholder={askLlmProvider === 'openai' ? 'sk-...' : 'sk-or-v1-...'}
                            />
                        </div>
                    </div>
                </PlaygroundStep>

                <PlaygroundStep
                    id="ask"
                    openId={openStep}
                    onToggle={toggleStep}
                    number={10}
                    title="ask AI (with memory)"
                    description="your LLM key + Walrus Memory layer"
                    onRun={runAsk}
                    runLabel="Ask"
                    loading={askLoading}
                    error={askError}
                    highlight
                    code={`const model = withMemWal(openai("gpt-4o-mini"), { key, accountId, serverUrl: "${serverUrl}" })`}
                >
                    <div className="input-group">
                        <label>your question:</label>
                        <input
                            className="input"
                            value={askQuestion}
                            onChange={(e) => setAskQuestion(e.target.value)}
                            placeholder="ask anything about this user..."
                        />
                    </div>
                    {askPhase && (
                        <div className="demo-phase-indicator">
                            <span className="spinner demo-button-spinner" />
                            {askPhase}
                        </div>
                    )}
                    {askResult && (
                        <>
                            <div className="demo-ai-panel">
                                <div className="demo-info-label">AI response (your LLM + Walrus Memory)</div>
                                <div className="demo-ai-answer">{askResult.answer}</div>
                            </div>
                            <div className="demo-result-panel">
                                <div className="demo-result-label">{askResult.memories.length} memories injected as context</div>
                                {askResult.memories.map((m, i) => (
                                    <div key={i} className="demo-memory-item">
                                        <span className="demo-memory-score">{((1 - m.distance) * 100).toFixed(0)}%</span>
                                        <span>{m.text}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </PlaygroundStep>

                <div className="demo-mode-divider">
                    manual mode — client handles embedding & encryption, server handles storage.
                    <br />
                    your data never leaves your browser unencrypted. requires an LLM API key.
                </div>

                <PlaygroundStep
                    id="manual-remember"
                    openId={openStep}
                    onToggle={toggleStep}
                    number={11}
                    title="remember (hybrid)"
                    description="client: embed → SEAL encrypt → server uploads Walrus"
                    onRun={runFullRemember}
                    loading={fullRememberLoading}
                    result={fullRememberResult}
                    error={fullRememberError}
                    highlight
                    code={`await memwal.rememberManual("${fullRememberText.slice(0, 40)}...")`}
                >
                    <div className="input-group">
                        <label>memory text:</label>
                        <textarea
                            className="input"
                            rows={2}
                            value={fullRememberText}
                            onChange={(e) => setFullRememberText(e.target.value)}
                        />
                    </div>
                    {fullRememberPhase && (
                        <div className="demo-phase-indicator">
                            <span className="spinner demo-button-spinner" />
                            {fullRememberPhase}
                        </div>
                    )}
                </PlaygroundStep>

                <PlaygroundStep
                    id="manual-recall"
                    openId={openStep}
                    onToggle={toggleStep}
                    number={12}
                    title="recall (full client-side)"
                    description="SDK: embed query → search → Walrus download → SEAL decrypt"
                    onRun={runFullRecall}
                    loading={fullRecallLoading}
                    result={fullRecallResult}
                    error={fullRecallError}
                    highlight
                    code={`const result = await memwal.recallManual("${fullRecallQuery}", 5)`}
                >
                    <div className="input-group">
                        <label>search query:</label>
                        <input
                            className="input"
                            value={fullRecallQuery}
                            onChange={(e) => setFullRecallQuery(e.target.value)}
                        />
                    </div>
                    {fullRecallPhase && (
                        <div className="demo-phase-indicator">
                            <span className="spinner demo-button-spinner" />
                            {fullRecallPhase}
                        </div>
                    )}
                </PlaygroundStep>

            </div>
        </>
    )
}
