/**
 * AggregationService - Cross-app data query with permission filtering
 *
 * Enables querying data across multiple app contexts while respecting
 * OAuth-style permissions and access control policies.
 */
import { normalizeSuiAddress } from '@mysten/sui/utils';
/**
 * AggregationService handles cross-app queries with permission filtering
 */
export class AggregationService {
    constructor(config) {
        this.suiClient = config.suiClient;
        this.packageId = config.packageId;
        this.permissionService = config.permissionService;
        this.contextWalletService = config.contextWalletService;
    }
    /**
     * Query data across multiple app contexts with permission enforcement
     * @param options - Query options
     * @returns Aggregated query results
     */
    async query(options) {
        const startTime = Date.now();
        const result = {
            results: [],
            totalResults: 0,
            queriedContexts: [],
            skippedContexts: [],
            metrics: {
                queryTime: 0,
                contextsChecked: 0,
                permissionChecks: 0
            }
        };
        const normalizedRequester = normalizeSuiAddress(options.requestingWallet);
        const normalizedTargets = options.targetWallets?.map(id => id.toLowerCase());
        const userContexts = await this.contextWalletService.listUserContexts(options.userAddress);
        const candidateContexts = normalizedTargets?.length
            ? userContexts.filter(ctx => {
                const contextIdLower = ctx.contextId.toLowerCase();
                const walletIdLower = ctx.id.toLowerCase();
                return normalizedTargets.includes(contextIdLower) || normalizedTargets.includes(walletIdLower);
            })
            : userContexts;
        result.metrics.contextsChecked = candidateContexts.length;
        // Check permissions and query allowed contexts
        for (const context of candidateContexts) {
            try {
                // Check if the requesting entity has permission to access this context
                const hasPermission = await this.permissionService.hasWalletPermission(normalizedRequester, context.id, options.scope);
                result.metrics.permissionChecks++;
                if (!hasPermission) {
                    result.skippedContexts.push(context.id);
                    continue;
                }
                // Query data from this context
                const perContextLimit = options.limit
                    ? Math.ceil(options.limit / Math.max(candidateContexts.length, 1))
                    : undefined;
                const contextData = await this.contextWalletService.listData(context.id, {
                    limit: perContextLimit
                });
                // Filter results based on query
                const filteredData = this.filterDataByQuery(contextData, options.query);
                if (filteredData.length > 0) {
                    result.results.push({
                        contextId: context.contextId,
                        targetWallet: context.id,
                        appId: context.appId,
                        data: filteredData,
                        hasMore: false // TODO: Implement pagination
                    });
                    result.totalResults += filteredData.length;
                    result.queriedContexts.push(context.id);
                }
            }
            catch (error) {
                console.error(`Error querying context ${context.id}:`, error);
                result.skippedContexts.push(context.id);
            }
        }
        // Apply global limit if specified
        if (options.limit && result.totalResults > options.limit) {
            result.results = this.applyGlobalLimit(result.results, options.limit);
            result.totalResults = options.limit;
        }
        result.metrics.queryTime = Date.now() - startTime;
        return result;
    }
    /**
     * Query with scope-based filtering
     * @param userAddress - User address
     * @param query - Search query
     * @param scopes - Required permission scopes
     * @returns Filtered aggregated results
     */
    async queryWithScopes(requestingWallet, userAddress, query, scopes) {
        // Get all user contexts
        const userContexts = await this.contextWalletService.listUserContexts(userAddress);
        // Filter contexts by permission scopes
        const allowedWallets = [];
        for (const context of userContexts) {
            let hasAllScopes = true;
            for (const scope of scopes) {
                const hasScope = await this.permissionService.hasWalletPermission(requestingWallet, context.id, scope);
                if (!hasScope) {
                    hasAllScopes = false;
                    break;
                }
            }
            if (hasAllScopes) {
                allowedWallets.push(context.id);
            }
        }
        return await this.query({
            requestingWallet,
            userAddress,
            query,
            scope: scopes[0],
            targetWallets: allowedWallets
        });
    }
    /**
     * Get aggregated statistics across contexts
     * @param userAddress - User address
     * @param appIds - Apps to include in statistics
     * @returns Aggregated statistics
     */
    async getAggregatedStats(userAddress, targetWallets) {
        const stats = {
            totalContexts: 0,
            totalItems: 0,
            totalSize: 0,
            categoryCounts: {},
            contextBreakdown: {},
            appBreakdown: {}
        };
        for (const walletId of targetWallets) {
            try {
                const contextStats = await this.contextWalletService.getContextStats(walletId);
                stats.totalContexts++;
                stats.totalItems += contextStats.itemCount;
                stats.totalSize += contextStats.totalSize;
                // Merge category counts
                for (const [category, count] of Object.entries(contextStats.categories)) {
                    stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + count;
                }
                // Context breakdown
                stats.contextBreakdown[walletId] = {
                    items: contextStats.itemCount,
                    size: contextStats.totalSize,
                    lastActivity: contextStats.lastActivity
                };
                // Legacy alias
                stats.appBreakdown[walletId] = {
                    items: contextStats.itemCount,
                    size: contextStats.totalSize,
                    lastActivity: contextStats.lastActivity
                };
            }
            catch (error) {
                console.error(`Error getting stats for wallet ${walletId}:`, error);
            }
        }
        return stats;
    }
    /**
     * Search across contexts with permission validation
     * @param userAddress - User address
     * @param searchQuery - Search query
     * @param options - Search options
     * @returns Search results
     */
    async search(requestingWallet, userAddress, searchQuery, options) {
        const targetWallets = options?.targetWallets ? [...options.targetWallets] : [];
        // If no contexts specified, get all user contexts
        if (targetWallets.length === 0) {
            const userContexts = await this.contextWalletService.listUserContexts(userAddress);
            targetWallets.push(...userContexts.map(c => c.id));
        }
        return await this.query({
            requestingWallet,
            userAddress,
            query: searchQuery,
            scope: options?.minPermissionScope || 'read:memories',
            limit: options?.limit,
            targetWallets
        });
    }
    /**
     * Filter data by search query
     * @private
     */
    filterDataByQuery(data, query) {
        if (!query)
            return data;
        const lowerQuery = query.toLowerCase();
        return data.filter(item => item.content.toLowerCase().includes(lowerQuery) ||
            item.category?.toLowerCase().includes(lowerQuery) ||
            Object.values(item.metadata || {}).some(value => String(value).toLowerCase().includes(lowerQuery)));
    }
    /**
     * Apply global result limit across contexts
     * @private
     */
    applyGlobalLimit(results, limit) {
        let totalCount = 0;
        const limitedResults = [];
        for (const result of results) {
            if (totalCount >= limit)
                break;
            const remainingLimit = limit - totalCount;
            const limitedData = result.data.slice(0, remainingLimit);
            limitedResults.push({
                ...result,
                data: limitedData
            });
            totalCount += limitedData.length;
        }
        return limitedResults;
    }
}
//# sourceMappingURL=AggregationService.js.map