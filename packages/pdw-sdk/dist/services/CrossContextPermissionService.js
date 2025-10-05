"use strict";
/**
 * Cross-Context Permission Service
 *
 * Manages cross-context access permissions for the Personal Data Wallet.
 * Enables apps to request and manage access to data from other app contexts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossContextPermissionService = void 0;
const transactions_1 = require("@mysten/sui/transactions");
const utils_1 = require("@mysten/sui/utils");
/**
 * Service for managing cross-context permissions
 */
class CrossContextPermissionService {
    constructor(config, client) {
        this.packageId = config.packageId;
        this.accessRegistryId = config.accessRegistryId;
        this.client = client;
    }
    /**
     * Register a new context wallet for an app
     *
     * @param options - Context registration options
     * @param signer - Transaction signer
     * @returns Transaction digest
     */
    async registerContextWallet(options, signer) {
        const tx = this.buildRegisterContextWalletTransaction(options);
        const result = await this.client.signAndExecuteTransaction({
            transaction: tx,
            signer,
            options: {
                showEffects: true,
                showEvents: true,
            },
        });
        if (result.effects?.status?.status !== 'success') {
            throw new Error(`Failed to register context: ${result.effects?.status?.error}`);
        }
        return result.digest;
    }
    /**
     * Build transaction to register a context wallet
     *
     * @param options - Context registration options
     * @returns Transaction object
     */
    buildRegisterContextWalletTransaction(options) {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::seal_access_control::register_context_wallet`,
            arguments: [
                tx.object(this.accessRegistryId),
                tx.pure.address((0, utils_1.normalizeSuiAddress)(options.contextWallet)),
                tx.pure.u64(options.derivationIndex),
                tx.pure.string(options.appHint ?? ''),
                tx.object('0x6'), // Clock object
            ],
        });
        return tx;
    }
    /**
     * Grant cross-context access permission
     *
     * @param options - Permission grant options
     * @param signer - Transaction signer
     * @returns Transaction digest
     */
    async grantWalletAllowlistAccess(options, signer) {
        const tx = this.buildGrantWalletAllowlistTransaction(options);
        const result = await this.client.signAndExecuteTransaction({
            transaction: tx,
            signer,
            options: {
                showEffects: true,
                showEvents: true,
            },
        });
        if (result.effects?.status?.status !== 'success') {
            throw new Error(`Failed to grant access: ${result.effects?.status?.error}`);
        }
        return result.digest;
    }
    /**
     * Build transaction to grant cross-context access
     *
     * @param options - Permission grant options
     * @returns Transaction object
     */
    buildGrantWalletAllowlistTransaction(options) {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::seal_access_control::grant_wallet_allowlist_access`,
            arguments: [
                tx.object(this.accessRegistryId),
                tx.pure.address((0, utils_1.normalizeSuiAddress)(options.requestingWallet)),
                tx.pure.address((0, utils_1.normalizeSuiAddress)(options.targetWallet)),
                tx.pure.string(options.scope ?? 'read'),
                tx.pure.string(options.accessLevel),
                tx.pure.u64(options.expiresAt),
                tx.object('0x6'), // Clock object
            ],
        });
        return tx;
    }
    /**
     * Revoke cross-context access permission
     *
     * @param options - Permission revocation options
     * @param signer - Transaction signer
     * @returns Transaction digest
     */
    async revokeWalletAllowlistAccess(options, signer) {
        const tx = this.buildRevokeWalletAllowlistTransaction(options);
        const result = await this.client.signAndExecuteTransaction({
            transaction: tx,
            signer,
            options: {
                showEffects: true,
                showEvents: true,
            },
        });
        if (result.effects?.status?.status !== 'success') {
            throw new Error(`Failed to revoke access: ${result.effects?.status?.error}`);
        }
        return result.digest;
    }
    /**
     * Build transaction to revoke cross-context access
     *
     * @param options - Permission revocation options
     * @returns Transaction object
     */
    buildRevokeWalletAllowlistTransaction(options) {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::seal_access_control::revoke_wallet_allowlist_access`,
            arguments: [
                tx.object(this.accessRegistryId),
                tx.pure.address((0, utils_1.normalizeSuiAddress)(options.requestingWallet)),
                tx.pure.address((0, utils_1.normalizeSuiAddress)(options.targetWallet)),
                tx.pure.string(options.scope ?? 'read'),
            ],
        });
        return tx;
    }
    /**
     * Build seal_approve transaction for a requesting wallet address
     *
     * @param contentId - Content identifier (SEAL key ID bytes)
     * @param requestingWallet - Wallet requesting decryption
     * @returns Transaction object
     */
    buildSealApproveTransaction(contentId, requestingWallet) {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::seal_access_control::seal_approve`,
            arguments: [
                tx.pure.vector('u8', Array.from(contentId)),
                tx.pure.address((0, utils_1.normalizeSuiAddress)(requestingWallet)),
                tx.object(this.accessRegistryId),
                tx.object('0x6'), // Clock object
            ],
        });
        return tx;
    }
    /**
     * Query wallet allowlist permissions filtered by requester, target, or scope
     */
    async queryWalletPermissions(options) {
        const events = await this.fetchWalletAllowlistEvents();
        const state = this.reduceWalletAllowlistEvents(events);
        const normalizedRequester = options.requestingWallet ? (0, utils_1.normalizeSuiAddress)(options.requestingWallet) : undefined;
        const normalizedTarget = options.targetWallet ? (0, utils_1.normalizeSuiAddress)(options.targetWallet) : undefined;
        const scopeFilter = options.scope ?? undefined;
        return Array.from(state.values())
            .filter((permission) => {
            if (normalizedRequester && permission.requestingWallet !== normalizedRequester) {
                return false;
            }
            if (normalizedTarget && permission.targetWallet !== normalizedTarget) {
                return false;
            }
            if (scopeFilter && permission.scope !== scopeFilter) {
                return false;
            }
            return true;
        });
    }
    async listGrantsByTarget(targetWallet, scope) {
        return this.queryWalletPermissions({ targetWallet, scope });
    }
    async listGrantsByRequester(requestingWallet, scope) {
        return this.queryWalletPermissions({ requestingWallet, scope });
    }
    /**
     * Determine whether a wallet currently has allowlist permission
     */
    async hasWalletPermission(options) {
        const permissions = await this.queryWalletPermissions(options);
        const now = Date.now();
        return permissions.some(permission => {
            const expiry = permission.expiresAt;
            return expiry === 0 || expiry > now;
        });
    }
    /**
     * List target wallets this requester can access for an optional scope
     */
    async getAccessibleWallets(requestingWallet, scope = 'read') {
        const permissions = await this.queryWalletPermissions({ requestingWallet, scope });
        const now = Date.now();
        return permissions
            .filter(permission => permission.expiresAt === 0 || permission.expiresAt > now)
            .map(permission => permission.targetWallet);
    }
    async getWalletAllowlistHistory(filter) {
        const events = await this.fetchWalletAllowlistEvents();
        const normalizedRequester = filter?.requestingWallet
            ? (0, utils_1.normalizeSuiAddress)(filter.requestingWallet)
            : undefined;
        const normalizedTarget = filter?.targetWallet
            ? (0, utils_1.normalizeSuiAddress)(filter.targetWallet)
            : undefined;
        return events
            .filter((event) => {
            if (normalizedRequester && event.requestingWallet !== normalizedRequester) {
                return false;
            }
            if (normalizedTarget && event.targetWallet !== normalizedTarget) {
                return false;
            }
            return true;
        })
            .map((event) => ({
            timestamp: event.grantedAt,
            action: event.granted ? 'grant' : 'revoke',
            requestingWallet: event.requestingWallet,
            targetWallet: event.targetWallet,
            scope: event.scope,
            accessLevel: event.accessLevel,
            expiresAt: event.expiresAt,
            grantedBy: event.grantedBy,
        }))
            .sort((a, b) => a.timestamp - b.timestamp);
    }
    async fetchWalletAllowlistEvents() {
        const response = await this.client.queryEvents({
            query: {
                MoveEventType: `${this.packageId}::seal_access_control::WalletAllowlistChanged`,
            },
            limit: 1000,
            order: 'ascending',
        });
        const events = [];
        for (const event of response.data) {
            const parsed = event.parsedJson;
            if (!parsed) {
                continue;
            }
            const requestingWallet = (0, utils_1.normalizeSuiAddress)(String(parsed.requester_wallet));
            const targetWallet = (0, utils_1.normalizeSuiAddress)(String(parsed.target_wallet));
            const scope = String(parsed.scope ?? 'read');
            const accessLevel = String(parsed.access_level ?? 'read');
            const granted = Boolean(parsed.granted);
            const expiresAt = Number(parsed.expires_at ?? 0);
            const grantedBy = (0, utils_1.normalizeSuiAddress)(String(parsed.granted_by ?? requestingWallet));
            const grantedAt = Number(event.timestampMs ?? Date.now());
            const key = `${requestingWallet}-${targetWallet}-${scope}`;
            events.push({
                key,
                requestingWallet,
                targetWallet,
                scope,
                accessLevel,
                granted,
                expiresAt,
                grantedAt,
                grantedBy,
            });
        }
        return events;
    }
    reduceWalletAllowlistEvents(events) {
        const state = new Map();
        const sorted = [...events].sort((a, b) => a.grantedAt - b.grantedAt);
        for (const event of sorted) {
            if (event.granted) {
                state.set(event.key, {
                    requestingWallet: event.requestingWallet,
                    targetWallet: event.targetWallet,
                    scope: event.scope,
                    accessLevel: event.accessLevel,
                    grantedAt: event.grantedAt,
                    expiresAt: event.expiresAt,
                    grantedBy: event.grantedBy,
                });
            }
            else {
                state.delete(event.key);
            }
        }
        return state;
    }
}
exports.CrossContextPermissionService = CrossContextPermissionService;
//# sourceMappingURL=CrossContextPermissionService.js.map