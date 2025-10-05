'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type ChatSession = {
  id: string;
  title: string;
  userAddress: string;
  archived: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

type MemoryRecord = {
  id?: string;
  content?: string;
  category?: string;
  metadata?: Record<string, unknown> | null;
  timestamp?: string;
  similarity_score?: number;
};

type ConsentStatus = 'pending' | 'approved' | 'denied';

type ConsentRequestRecord = {
  requestId: string;
  requesterWallet: string;
  targetWallet: string;
  targetScopes: string[];
  purpose: string;
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
  status: ConsentStatus;
};

type AccessGrantRecord = {
  id: string;
  requestingWallet: string;
  targetWallet: string;
  scopes: string[];
  grantedAt: number;
  expiresAt?: number;
  revokedAt?: number;
  transactionDigest?: string;
};

type PermissionAuditEntry = {
  timestamp: number;
  action: 'grant' | 'revoke' | 'request' | 'deny';
  requestingWallet: string;
  targetWallet: string;
  scopes: string[];
};

const backendBaseUrl = (process.env.NEXT_PUBLIC_PDW_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${backendBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function formatTimestamp(value: string | number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function Page() {
  const [userAddress, setUserAddress] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [memoryQuery, setMemoryQuery] = useState('');
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [manualMemoryContent, setManualMemoryContent] = useState('');
  const [manualMemoryCategory, setManualMemoryCategory] = useState('');
  const [manualMemoryTopic, setManualMemoryTopic] = useState('');
  const [manualMemoryImportance, setManualMemoryImportance] = useState('');
  const [manualMemoryMetadata, setManualMemoryMetadata] = useState('');
  const [manualMemoryEncrypt, setManualMemoryEncrypt] = useState(true);
  const [pendingConsents, setPendingConsents] = useState<ConsentRequestRecord[]>([]);
  const [accessGrants, setAccessGrants] = useState<AccessGrantRecord[]>([]);
  const [permissionAudit, setPermissionAudit] = useState<PermissionAuditEntry[]>([]);
  const [loadingPendingConsents, setLoadingPendingConsents] = useState(false);
  const [loadingAccessGrants, setLoadingAccessGrants] = useState(false);
  const [loadingPermissionAudit, setLoadingPermissionAudit] = useState(false);
  const [consentContextIds, setConsentContextIds] = useState<Record<string, string>>({});

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [sessions, selectedSessionId]
  );

  const userAddressIsValid = useMemo(() => /^0x[a-fA-F0-9]{64}$/.test(userAddress), [userAddress]);

  const loadSessions = useCallback(async () => {
    if (!userAddressIsValid) {
      setSessions([]);
      setSelectedSessionId(null);
      return;
    }

    try {
      setLoadingSessions(true);
      const data = await getJson<{ sessions: ChatSession[] }>(`/chat/sessions?userAddress=${encodeURIComponent(userAddress)}`);
      setSessions(data.sessions);
      if (data.sessions.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data.sessions[0].id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load sessions';
      setError(message);
    } finally {
      setLoadingSessions(false);
    }
  }, [selectedSessionId, userAddress, userAddressIsValid]);

  const loadMessages = useCallback(
    async (sessionId: string) => {
      if (!userAddressIsValid) {
        setMessages([]);
        return;
      }

      try {
        setLoadingMessages(true);
        const data = await getJson<{ messages: ChatMessage[] }>(
          `/chat/sessions/${sessionId}/messages?userAddress=${encodeURIComponent(userAddress)}`
        );
        setMessages(data.messages);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load messages';
        setError(message);
      } finally {
        setLoadingMessages(false);
      }
    },
    [userAddress, userAddressIsValid]
  );

  const loadMemories = useCallback(
    async (query?: string) => {
      if (!userAddressIsValid) {
        setMemories([]);
        return;
      }

      const queryParam = query && query.trim().length > 0 ? `&query=${encodeURIComponent(query.trim())}` : '';

      try {
        setLoadingMemories(true);
        const data = await getJson<{ memories: MemoryRecord[] }>(
          `/pdw/memories?userAddress=${encodeURIComponent(userAddress)}${queryParam}`
        );
        setMemories(Array.isArray(data.memories) ? data.memories : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load memories';
        setError(message);
      } finally {
        setLoadingMemories(false);
      }
    },
    [userAddress, userAddressIsValid]
  );

  const loadPendingConsents = useCallback(async () => {
    if (!userAddressIsValid) {
      setPendingConsents([]);
      setConsentContextIds({});
      return;
    }

    try {
      setLoadingPendingConsents(true);
      const data = await getJson<{ pending: ConsentRequestRecord[] }>(
        `/pdw/consents/pending?userAddress=${encodeURIComponent(userAddress)}`
      );
      const pending = Array.isArray(data.pending) ? data.pending : [];
      setPendingConsents(pending);
      setConsentContextIds((previous) => {
        const next: Record<string, string> = {};
        for (const record of pending) {
          next[record.requestId] = previous[record.requestId] ?? record.targetWallet;
        }
        return next;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load consent requests';
      setError(message);
    } finally {
      setLoadingPendingConsents(false);
    }
  }, [userAddress, userAddressIsValid]);

  const loadAccessGrants = useCallback(async () => {
    if (!userAddressIsValid) {
      setAccessGrants([]);
      return;
    }

    try {
      setLoadingAccessGrants(true);
      const data = await getJson<{ grants: AccessGrantRecord[] }>(
        `/pdw/consents/grants?userAddress=${encodeURIComponent(userAddress)}`
      );
      setAccessGrants(Array.isArray(data.grants) ? data.grants : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load access grants';
      setError(message);
    } finally {
      setLoadingAccessGrants(false);
    }
  }, [userAddress, userAddressIsValid]);

  const loadPermissionAudit = useCallback(async () => {
    if (!userAddressIsValid) {
      setPermissionAudit([]);
      return;
    }

    try {
      setLoadingPermissionAudit(true);
      const data = await getJson<{ audit: PermissionAuditEntry[] }>(
        `/pdw/consents/audit?userAddress=${encodeURIComponent(userAddress)}`
      );
      setPermissionAudit(Array.isArray(data.audit) ? data.audit : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load permission audit log';
      setError(message);
    } finally {
      setLoadingPermissionAudit(false);
    }
  }, [userAddress, userAddressIsValid]);

  useEffect(() => {
    if (userAddressIsValid) {
      void loadSessions();
      void loadMemories(memoryQuery);
    } else {
      setSessions([]);
      setSelectedSessionId(null);
      setMessages([]);
      setMemories([]);
    }
  }, [loadMemories, loadSessions, memoryQuery, userAddressIsValid]);

  useEffect(() => {
    if (userAddressIsValid) {
      void loadPendingConsents();
      void loadAccessGrants();
      void loadPermissionAudit();
    } else {
      setPendingConsents([]);
      setAccessGrants([]);
      setPermissionAudit([]);
      setConsentContextIds({});
    }
  }, [loadAccessGrants, loadPendingConsents, loadPermissionAudit, userAddressIsValid]);

  useEffect(() => {
    if (selectedSessionId && userAddressIsValid) {
      void loadMessages(selectedSessionId);
    }
  }, [loadMessages, selectedSessionId, userAddressIsValid]);

  const handleCreateSession = async () => {
    if (!userAddressIsValid || newSessionTitle.trim().length === 0) {
      setError('Provide a valid user address and session title.');
      return;
    }

    try {
      setStatus('Creating new session...');
      const result = await getJson<{ session: ChatSession }>(`/chat/sessions`, {
        method: 'POST',
        body: JSON.stringify({ title: newSessionTitle.trim(), userAddress }),
      });

      setSessions((prev) => [result.session, ...prev]);
      setSelectedSessionId(result.session.id);
      setNewSessionTitle('');
      setError(null);
      setStatus('Session created');
      setTimeout(() => setStatus(null), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      setError(message);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedSessionId || newMessage.trim().length === 0 || !userAddressIsValid) {
      setError('Select a session, enter a message, and provide a valid user address.');
      return;
    }

    try {
      setStatus('Sending message...');
      const response = await getJson<{
        session: ChatSession;
        messages: ChatMessage[];
        contextSummary?: string;
      }>(`/chat/sessions/${selectedSessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          userAddress,
          content: newMessage.trim(),
        }),
      });

      setMessages(response.messages);
      setSessions((prev) =>
        prev.map((session) => (session.id === response.session.id ? response.session : session))
      );
      setNewMessage('');
      setError(null);
      setStatus('Assistant replied');
      setTimeout(() => setStatus(null), 1500);

      if (response.contextSummary) {
        setMemories((prev) => [{ content: response.contextSummary, category: 'context-summary' }, ...prev]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      setError(message);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleRefreshMemories = () => {
    void loadMemories(memoryQuery);
  };

  const resetManualMemoryForm = () => {
    setManualMemoryContent('');
    setManualMemoryCategory('');
    setManualMemoryTopic('');
    setManualMemoryImportance('');
    setManualMemoryMetadata('');
    setManualMemoryEncrypt(true);
  };

  const handleCreateManualMemory = async () => {
    if (!userAddressIsValid) {
      setError('Provide a valid user address before creating a memory.');
      return;
    }

    if (manualMemoryContent.trim().length === 0) {
      setError('Enter content for the memory you want to store.');
      return;
    }

    let metadata: Record<string, unknown> | undefined;
    if (manualMemoryMetadata.trim().length > 0) {
      try {
        const parsed = JSON.parse(manualMemoryMetadata);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          setError('Metadata JSON must be an object.');
          return;
        }
        metadata = parsed as Record<string, unknown>;
      } catch (parseError) {
        const message = parseError instanceof Error ? parseError.message : 'Invalid metadata JSON payload.';
        setError(`Unable to parse metadata JSON: ${message}`);
        return;
      }
    }

    let importance: number | undefined;
    if (manualMemoryImportance.trim().length > 0) {
      const parsedImportance = Number(manualMemoryImportance);
      if (!Number.isFinite(parsedImportance)) {
        setError('Importance must be a numeric value between 0 and 10.');
        return;
      }
      if (parsedImportance < 0 || parsedImportance > 10) {
        setError('Importance must be between 0 and 10.');
        return;
      }
      importance = parsedImportance;
    }

    const payload = {
      userAddress,
      content: manualMemoryContent.trim(),
      category: manualMemoryCategory.trim() || undefined,
      topic: manualMemoryTopic.trim() || undefined,
      importance,
      metadata,
      encrypt: manualMemoryEncrypt,
    } satisfies {
      userAddress: string;
      content: string;
      category?: string;
      topic?: string;
      importance?: number;
      metadata?: Record<string, unknown>;
      encrypt?: boolean;
    };

    setStatus('Saving manual memory...');

    try {
      await getJson<{ memoryId: string }>(`/pdw/memories`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      resetManualMemoryForm();
      setError(null);
      await loadMemories(memoryQuery);
      setStatus('Manual memory saved');
      setTimeout(() => setStatus(null), 1500);
    } catch (err) {
      setStatus(null);
      const message = err instanceof Error ? err.message : 'Failed to create manual memory';
      setError(message);
    }
  };

  const handleResetManualMemory = () => {
    resetManualMemoryForm();
  };

  const handleRefreshConsents = () => {
    void loadPendingConsents();
    void loadAccessGrants();
    void loadPermissionAudit();
  };

  const handleApproveConsent = async (requestId: string) => {
    if (!userAddressIsValid) {
      setError('Provide a valid user address before approving consents.');
      return;
    }

    const consent = pendingConsents.find((record) => record.requestId === requestId);
    if (!consent) {
      setError('Consent request not found. Refresh and try again.');
      return;
    }

    const contextId = (consentContextIds[requestId] ?? '').trim();
    if (contextId.length === 0) {
      setError('Provide a context ID before approving the consent request.');
      return;
    }

    try {
      setStatus('Approving consent request...');
      await getJson<{ grant: AccessGrantRecord }>(`/pdw/consents/${encodeURIComponent(requestId)}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          userAddress,
          contextId,
        }),
      });

      await loadPendingConsents();
      await loadAccessGrants();
      await loadPermissionAudit();
      setError(null);
      setStatus('Consent approved');
      setTimeout(() => setStatus(null), 1500);
    } catch (err) {
      setStatus(null);
      const message = err instanceof Error ? err.message : 'Failed to approve consent request';
      setError(message);
    }
  };

  const handleDenyConsent = async (requestId: string) => {
    if (!userAddressIsValid) {
      setError('Provide a valid user address before denying consents.');
      return;
    }

    try {
      setStatus('Denying consent request...');
      await getJson<{ success: boolean }>(`/pdw/consents/${encodeURIComponent(requestId)}/deny`, {
        method: 'POST',
        body: JSON.stringify({ userAddress }),
      });

      await loadPendingConsents();
      await loadAccessGrants();
      await loadPermissionAudit();
      setError(null);
      setStatus('Consent denied');
      setTimeout(() => setStatus(null), 1500);
    } catch (err) {
      setStatus(null);
      const message = err instanceof Error ? err.message : 'Failed to deny consent request';
      setError(message);
    }
  };

  return (
    <main style={styles.main}>
      <section style={styles.header}>
        <h1>PDW Chat Demo</h1>
        <p>Interact with the Personal Data Wallet SDK through a minimal chat experience.</p>
      </section>

      <section style={styles.controls}>
        <div style={styles.controlGroup}>
          <label htmlFor="userAddress">User Sui Address</label>
          <input
            id="userAddress"
            type="text"
            placeholder="0x..."
            value={userAddress}
            onChange={(event) => setUserAddress(event.target.value.trim())}
            style={styles.input}
          />
          {!userAddressIsValid && userAddress.length > 0 && (
            <span style={styles.hint}>Enter a full 0x-prefixed, 64-hex-character Sui address.</span>
          )}
        </div>

        <div style={styles.controlGroup}>
          <label htmlFor="sessionTitle">New Session Title</label>
          <div style={styles.inlineGroup}>
            <input
              id="sessionTitle"
              type="text"
              placeholder="Brainstorming with PDW"
              value={newSessionTitle}
              onChange={(event) => setNewSessionTitle(event.target.value)}
              style={styles.input}
            />
            <button type="button" onClick={handleCreateSession} style={styles.primaryButton}>
              Create Session
            </button>
          </div>
        </div>
      </section>

      <section style={styles.columns}>
        <div style={styles.sessionsColumn}>
          <header style={styles.columnHeader}>
            <h2>Sessions</h2>
            <button type="button" onClick={loadSessions} style={styles.secondaryButton} disabled={loadingSessions}>
              {loadingSessions ? 'Loading...' : 'Refresh'}
            </button>
          </header>
          <div style={styles.listContainer}>
            {sessions.length === 0 && <p style={styles.placeholder}>No sessions yet. Create one to get started.</p>}
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => handleSelectSession(session.id)}
                style={{
                  ...styles.sessionCard,
                  borderColor: session.id === selectedSessionId ? '#38bdf8' : 'rgba(148, 163, 184, 0.2)',
                }}
              >
                <strong>{session.title}</strong>
                <small>{formatTimestamp(session.updatedAt)}</small>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.messagesColumn}>
          <header style={styles.columnHeader}>
            <h2>Conversation</h2>
            {selectedSession && <span style={styles.sessionMeta}>Session ID: {selectedSession.id}</span>}
          </header>
          <div style={styles.messagesContainer}>
            {loadingMessages && <p style={styles.placeholder}>Loading messages...</p>}
            {!loadingMessages && messages.length === 0 && (
              <p style={styles.placeholder}>No messages yet. Send a message to start the conversation.</p>
            )}
            {messages.map((message) => (
              <article key={message.id} style={styles.messageCard(message.role)}>
                <header style={styles.messageHeader}>
                  <strong>{message.role === 'assistant' ? 'Assistant' : 'User'}</strong>
                  <span>{formatTimestamp(message.createdAt)}</span>
                </header>
                <p style={styles.messageContent}>{message.content}</p>
              </article>
            ))}
          </div>
          <footer style={styles.messageComposer}>
            <textarea
              placeholder={selectedSessionId ? 'Ask a question, share context...' : 'Select a session to chat'}
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              disabled={!selectedSessionId}
              style={styles.textarea}
            />
            <button type="button" onClick={handleSendMessage} style={styles.primaryButton} disabled={!selectedSessionId}>
              Send
            </button>
          </footer>
        </div>

        <div style={styles.memoriesColumn}>
          <header style={styles.columnHeader}>
            <h2>Memory Context</h2>
            <button type="button" onClick={handleRefreshMemories} style={styles.secondaryButton} disabled={loadingMemories}>
              {loadingMemories ? 'Loading...' : 'Refresh'}
            </button>
          </header>
          <div style={styles.controlGroup}>
            <label htmlFor="memoryQuery">Search memories</label>
            <div style={styles.inlineGroup}>
              <input
                id="memoryQuery"
                type="text"
                placeholder="meeting notes"
                value={memoryQuery}
                onChange={(event) => setMemoryQuery(event.target.value)}
                style={styles.input}
              />
              <button type="button" onClick={handleRefreshMemories} style={styles.secondaryButton}>
                Search
              </button>
            </div>
          </div>
          <div style={styles.listContainer}>
            {memories.length === 0 && <p style={styles.placeholder}>No PDW memories yet.</p>}
            {memories.map((memory, index) => (
              <article key={`${memory.id ?? 'memory'}-${index}`} style={styles.memoryCard}>
                <header style={styles.memoryHeader}>
                  <span>{memory.category ?? 'memory'}</span>
                  {typeof memory.similarity_score === 'number' && (
                    <span style={styles.similarityChip}>{memory.similarity_score.toFixed(2)}</span>
                  )}
                </header>
                {memory.content && <p style={styles.memoryContent}>{memory.content}</p>}
                {memory.metadata && (
                  <pre style={styles.memoryMeta}>{JSON.stringify(memory.metadata, null, 2)}</pre>
                )}
              </article>
            ))}
          </div>
          <div style={styles.manualMemorySection}>
            <h3>Manual Memory Entry</h3>
            <p style={styles.hint}>Seed the wallet with handcrafted memories to guide the assistant&apos;s responses.</p>
            <div style={styles.controlGroup}>
              <label htmlFor="manualMemoryContent">Memory content</label>
              <textarea
                id="manualMemoryContent"
                placeholder="Summarize the user&apos;s recent achievements, preferences, or context..."
                value={manualMemoryContent}
                onChange={(event) => setManualMemoryContent(event.target.value)}
                style={{ ...styles.textarea, minHeight: '140px' }}
              />
            </div>
            <div style={styles.inlineGroup}>
              <div style={styles.controlGroup}>
                <label htmlFor="manualMemoryCategory">Category</label>
                <input
                  id="manualMemoryCategory"
                  type="text"
                  placeholder="manual-entry"
                  value={manualMemoryCategory}
                  onChange={(event) => setManualMemoryCategory(event.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.controlGroup}>
                <label htmlFor="manualMemoryTopic">Topic</label>
                <input
                  id="manualMemoryTopic"
                  type="text"
                  placeholder="user-profile"
                  value={manualMemoryTopic}
                  onChange={(event) => setManualMemoryTopic(event.target.value)}
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.inlineGroup}>
              <div style={styles.controlGroup}>
                <label htmlFor="manualMemoryImportance">Importance (0-10)</label>
                <input
                  id="manualMemoryImportance"
                  type="number"
                  min="0"
                  max="10"
                  step="1"
                  placeholder="5"
                  value={manualMemoryImportance}
                  onChange={(event) => setManualMemoryImportance(event.target.value)}
                  style={styles.input}
                />
              </div>
              <label htmlFor="manualMemoryEncrypt" style={styles.checkboxRow}>
                <input
                  id="manualMemoryEncrypt"
                  type="checkbox"
                  checked={manualMemoryEncrypt}
                  onChange={(event) => setManualMemoryEncrypt(event.target.checked)}
                  style={styles.checkbox}
                />
                Encrypt before storing (recommended)
              </label>
            </div>
            <div style={styles.controlGroup}>
              <label htmlFor="manualMemoryMetadata">Metadata (JSON object)</label>
              <textarea
                id="manualMemoryMetadata"
                placeholder='{"tags": ["demo", "user"], "source": "manual"}'
                value={manualMemoryMetadata}
                onChange={(event) => setManualMemoryMetadata(event.target.value)}
                style={{ ...styles.textarea, minHeight: '120px' }}
              />
            </div>
            <div style={styles.formActions}>
              <button
                type="button"
                onClick={handleCreateManualMemory}
                style={styles.primaryButton}
                disabled={!userAddressIsValid || manualMemoryContent.trim().length === 0}
              >
                Save Memory
              </button>
              <button type="button" onClick={handleResetManualMemory} style={styles.secondaryButton}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.consentsSection}>
        <header style={styles.consentsHeader}>
          <div>
            <h2>Access Consents</h2>
            <p style={styles.subtleText}>Review pending cross-app requests, active grants, and the audit trail.</p>
          </div>
          <button type="button" onClick={handleRefreshConsents} style={styles.secondaryButton}>
            Refresh
          </button>
        </header>

        <div style={styles.consentsGrid}>
          <section style={styles.consentCard}>
            <header style={styles.consentCardHeader}>
              <h3>Pending Requests</h3>
              <span style={styles.badge}>{pendingConsents.length}</span>
            </header>
            {loadingPendingConsents && <p style={styles.placeholder}>Loading pending consents...</p>}
            {!loadingPendingConsents && pendingConsents.length === 0 && (
              <p style={styles.placeholder}>No pending consent requests.</p>
            )}
            {!loadingPendingConsents &&
              pendingConsents.map((request) => (
                <article key={request.requestId} style={styles.consentEntry}>
                  <div style={styles.consentMeta}>
                    <span>
                      <strong>Requester:</strong> {request.requesterWallet}
                    </span>
                    <span>
                      <strong>Target wallet:</strong> {request.targetWallet}
                    </span>
                    <span>
                      <strong>Purpose:</strong> {request.purpose}
                    </span>
                    <span>
                      <strong>Requested:</strong> {formatTimestamp(request.createdAt)}
                    </span>
                    {typeof request.expiresAt === 'number' && (
                      <span>
                        <strong>Expires:</strong> {formatTimestamp(request.expiresAt)}
                      </span>
                    )}
                  </div>
                  <div style={styles.scopeList}>
                    {request.targetScopes.map((scope) => (
                      <span key={`${request.requestId}-${scope}`} style={styles.scopeTag}>
                        {scope}
                      </span>
                    ))}
                  </div>
                  <label style={styles.controlGroup}>
                    <span>Context ID</span>
                    <input
                      type="text"
                      value={consentContextIds[request.requestId] ?? ''}
                      onChange={(event) =>
                        setConsentContextIds((prev) => ({
                          ...prev,
                          [request.requestId]: event.target.value,
                        }))
                      }
                      style={styles.input}
                    />
                  </label>
                  <div style={styles.consentActions}>
                    <button
                      type="button"
                      onClick={() => handleApproveConsent(request.requestId)}
                      style={styles.primaryButton}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDenyConsent(request.requestId)}
                      style={styles.dangerButton}
                    >
                      Deny
                    </button>
                  </div>
                </article>
              ))}
          </section>

          <section style={styles.consentCard}>
            <header style={styles.consentCardHeader}>
              <h3>Active Grants</h3>
              <span style={styles.badge}>{accessGrants.length}</span>
            </header>
            {loadingAccessGrants && <p style={styles.placeholder}>Loading access grants...</p>}
            {!loadingAccessGrants && accessGrants.length === 0 && (
              <p style={styles.placeholder}>No access grants recorded.</p>
            )}
            {!loadingAccessGrants &&
              accessGrants.map((grant) => (
                <article key={grant.id} style={styles.consentEntry}>
                  <div style={styles.consentMeta}>
                    <span>
                      <strong>Requester:</strong> {grant.requestingWallet}
                    </span>
                    <span>
                      <strong>Target wallet:</strong> {grant.targetWallet}
                    </span>
                    <span>
                      <strong>Granted:</strong> {formatTimestamp(grant.grantedAt)}
                    </span>
                    {typeof grant.expiresAt === 'number' && (
                      <span>
                        <strong>Expires:</strong> {formatTimestamp(grant.expiresAt)}
                      </span>
                    )}
                    {grant.transactionDigest && (
                      <span>
                        <strong>Digest:</strong> {grant.transactionDigest}
                      </span>
                    )}
                  </div>
                  <div style={styles.scopeList}>
                    {grant.scopes.map((scope) => (
                      <span key={`${grant.id}-${scope}`} style={styles.scopeTag}>
                        {scope}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
          </section>

          <section style={styles.consentCard}>
            <header style={styles.consentCardHeader}>
              <h3>Audit Log</h3>
              <span style={styles.badge}>{permissionAudit.length}</span>
            </header>
            {loadingPermissionAudit && <p style={styles.placeholder}>Loading audit events...</p>}
            {!loadingPermissionAudit && permissionAudit.length === 0 && (
              <p style={styles.placeholder}>No audit events recorded.</p>
            )}
            {!loadingPermissionAudit && (
              <div style={styles.auditList}>
                {permissionAudit.map((entry, index) => (
                  <article key={`${entry.timestamp}-${entry.action}-${index}`} style={styles.auditItem}>
                    <header style={styles.auditHeader}>
                      <span style={styles.auditAction}>{entry.action.toUpperCase()}</span>
                      <span style={styles.timestamp}>{formatTimestamp(entry.timestamp)}</span>
                    </header>
                    <div style={styles.consentMeta}>
                      <span>
                        <strong>Requester:</strong> {entry.requestingWallet}
                      </span>
                      <span>
                        <strong>Target:</strong> {entry.targetWallet}
                      </span>
                    </div>
                    <div style={styles.scopeList}>
                      {entry.scopes.map((scope) => (
                        <span key={`${entry.timestamp}-${scope}`} style={styles.scopeTag}>
                          {scope}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <section style={styles.statusBar}>
        {status && <span style={styles.statusMessage}>{status}</span>}
        {error && (
          <span style={styles.errorMessage}>
            {error}
            <button type="button" onClick={() => setError(null)} style={styles.clearErrorButton}>
              ×
            </button>
          </span>
        )}
      </section>
    </main>
  );
}

const styles = {
  main: {
    padding: '2.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  controls: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.25)',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  inlineGroup: {
    display: 'flex',
    gap: '0.75rem',
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: '#e2e8f0',
    flex: 1,
  },
  textarea: {
    minHeight: '120px',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: '#e2e8f0',
    resize: 'vertical' as const,
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
    color: '#0f172a',
    border: 'none',
    borderRadius: '0.75rem',
    padding: '0.75rem 1.25rem',
    fontWeight: 600,
    transition: 'transform 0.15s ease',
  },
  secondaryButton: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    color: '#e2e8f0',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    borderRadius: '0.75rem',
    padding: '0.6rem 1.1rem',
    fontWeight: 500,
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr 320px',
    gap: '1.25rem',
  },
  sessionsColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    borderRadius: '1rem',
    padding: '1rem',
    gap: '1rem',
  },
  messagesColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    borderRadius: '1rem',
    padding: '1rem',
    gap: '1rem',
    minHeight: '540px',
  },
  memoriesColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    borderRadius: '1rem',
    padding: '1rem',
    gap: '1rem',
  },
  manualMemorySection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '1rem',
    border: '1px dashed rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionMeta: {
    fontSize: '0.8rem',
    color: 'rgba(148, 163, 184, 0.8)',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    maxHeight: '450px',
    overflowY: 'auto' as const,
  },
  placeholder: {
    color: 'rgba(148, 163, 184, 0.7)',
    fontStyle: 'italic',
  },
  sessionCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '0.25rem',
    padding: '0.75rem',
    width: '100%',
    borderRadius: '0.75rem',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    color: '#e2e8f0',
    textAlign: 'left' as const,
  },
  messagesContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    overflowY: 'auto' as const,
    paddingRight: '0.5rem',
  },
  messageCard: (role: ChatMessage['role']) => ({
    background: role === 'assistant' ? 'rgba(51, 65, 85, 0.95)' : 'rgba(30, 41, 59, 0.93)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    boxShadow: '0 12px 25px rgba(15, 23, 42, 0.25)',
    color: '#e2e8f0',
  }),
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    marginBottom: '0.4rem',
    color: 'rgba(148, 163, 184, 0.8)',
  },
  messageContent: {
    whiteSpace: 'pre-wrap' as const,
    lineHeight: 1.5,
  },
  messageComposer: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end',
  },
  memoryCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: '0.75rem',
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
  },
  memoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'rgba(148, 163, 184, 0.8)',
  },
  memoryContent: {
    lineHeight: 1.4,
  },
  memoryMeta: {
    background: 'rgba(15, 23, 42, 0.85)',
    borderRadius: '0.5rem',
    padding: '0.5rem',
    fontSize: '0.75rem',
    overflowX: 'auto' as const,
  },
  similarityChip: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderRadius: '9999px',
    padding: '0.2rem 0.6rem',
    color: '#38bdf8',
    fontSize: '0.75rem',
  },
  consentsSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    borderRadius: '1rem',
    padding: '1.5rem',
  },
  consentsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtleText: {
    color: 'rgba(148, 163, 184, 0.7)',
    fontSize: '0.9rem',
    marginTop: '0.25rem',
  },
  consentsGrid: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  },
  consentCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    borderRadius: '1rem',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    padding: '1rem',
    maxHeight: '460px',
    overflowY: 'auto' as const,
  },
  consentCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '1.75rem',
    padding: '0.2rem 0.55rem',
    borderRadius: '9999px',
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    color: '#38bdf8',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  consentEntry: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    padding: '0.85rem',
    borderRadius: '0.85rem',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
  },
  consentMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
    fontSize: '0.85rem',
    color: 'rgba(226, 232, 240, 0.9)',
  },
  scopeList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.4rem',
  },
  scopeTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    color: '#38bdf8',
    borderRadius: '9999px',
    padding: '0.2rem 0.6rem',
    fontSize: '0.75rem',
  },
  consentActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    justifyContent: 'flex-end',
    flexWrap: 'wrap' as const,
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#fda4af',
    border: '1px solid rgba(239, 68, 68, 0.45)',
    borderRadius: '0.75rem',
    padding: '0.6rem 1.1rem',
    fontWeight: 500,
  },
  auditList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.65rem',
  },
  auditItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: '0.85rem',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
  },
  auditHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  auditAction: {
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: '#38bdf8',
  },
  timestamp: {
    fontSize: '0.75rem',
    color: 'rgba(148, 163, 184, 0.8)',
  },
  formActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    color: '#e2e8f0',
    flex: 1,
  },
  checkbox: {
    width: '1.1rem',
    height: '1.1rem',
    accentColor: '#38bdf8',
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '32px',
  },
  statusMessage: {
    color: '#38bdf8',
  },
  errorMessage: {
    color: '#fca5a5',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  clearErrorButton: {
    background: 'transparent',
    border: '1px solid rgba(248, 113, 113, 0.5)',
    borderRadius: '9999px',
    color: '#fca5a5',
    width: '1.5rem',
    height: '1.5rem',
  },
  hint: {
    fontSize: '0.8rem',
    color: 'rgba(148, 163, 184, 0.8)',
  },
} satisfies Record<string, unknown>;
