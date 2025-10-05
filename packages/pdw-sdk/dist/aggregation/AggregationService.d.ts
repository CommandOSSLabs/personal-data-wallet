/**
 * AggregationService - Cross-app data query with permission filtering
 *
 * Enables querying data across multiple app contexts while respecting
 * OAuth-style permissions and access control policies.
 */
import { SuiClient } from '@mysten/sui/client';
import { AggregatedQueryOptions, PermissionScope } from '../types/wallet.js';
import { PermissionService } from '../access/PermissionService.js';
import { ContextWalletService } from '../wallet/ContextWalletService.js';
/**
 * Configuration for AggregationService
 */
export interface AggregationServiceConfig {
    /** Sui client instance */
    suiClient: SuiClient;
    /** Package ID for Move contracts */
    packageId: string;
    /** Permission service for access validation */
    permissionService: PermissionService;
    /** Context wallet service for data access */
    contextWalletService: ContextWalletService;
}
/**
 * Result of an aggregated query
 */
export interface AggregatedQueryResult {
    /** Query results organized by app context */
    results: Array<{
        contextId: string;
        targetWallet: string;
        appId: string;
        data: Array<{
            id: string;
            content: string;
            category?: string;
            metadata?: Record<string, any>;
            createdAt: number;
        }>;
        hasMore: boolean;
    }>;
    /** Total number of results across all contexts */
    totalResults: number;
    /** Contexts that were queried */
    queriedContexts: string[];
    /** Contexts that were skipped due to permissions */
    skippedContexts: string[];
    /** Query performance metrics */
    metrics: {
        queryTime: number;
        contextsChecked: number;
        permissionChecks: number;
    };
}
/**
 * AggregationService handles cross-app queries with permission filtering
 */
export declare class AggregationService {
    private suiClient;
    private packageId;
    private permissionService;
    private contextWalletService;
    constructor(config: AggregationServiceConfig);
    /**
     * Query data across multiple app contexts with permission enforcement
     * @param options - Query options
     * @returns Aggregated query results
     */
    query(options: AggregatedQueryOptions): Promise<AggregatedQueryResult>;
    /**
     * Query with scope-based filtering
     * @param userAddress - User address
     * @param query - Search query
     * @param scopes - Required permission scopes
     * @returns Filtered aggregated results
     */
    queryWithScopes(requestingWallet: string, userAddress: string, query: string, scopes: PermissionScope[]): Promise<AggregatedQueryResult>;
    /**
     * Get aggregated statistics across contexts
     * @param userAddress - User address
     * @param appIds - Apps to include in statistics
     * @returns Aggregated statistics
     */
    getAggregatedStats(userAddress: string, targetWallets: string[]): Promise<{
        totalContexts: number;
        totalItems: number;
        totalSize: number;
        categoryCounts: Record<string, number>;
        contextBreakdown: Record<string, {
            items: number;
            size: number;
            lastActivity: number;
        }>;
        appBreakdown?: Record<string, {
            items: number;
            size: number;
            lastActivity: number;
        }>;
    }>;
    /**
     * Search across contexts with permission validation
     * @param userAddress - User address
     * @param searchQuery - Search query
     * @param options - Search options
     * @returns Search results
     */
    search(requestingWallet: string, userAddress: string, searchQuery: string, options?: {
        targetWallets?: string[];
        categories?: string[];
        limit?: number;
        minPermissionScope?: PermissionScope;
    }): Promise<AggregatedQueryResult>;
    /**
     * Filter data by search query
     * @private
     */
    private filterDataByQuery;
    /**
     * Apply global result limit across contexts
     * @private
     */
    private applyGlobalLimit;
}
//# sourceMappingURL=AggregationService.d.ts.map