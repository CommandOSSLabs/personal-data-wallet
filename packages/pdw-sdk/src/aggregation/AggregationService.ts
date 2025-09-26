/**
 * AggregationService - Cross-app data query with permission filtering
 * 
 * Enables querying data across multiple app contexts while respecting
 * OAuth-style permissions and access control policies.
 */

import { SuiClient } from '@mysten/sui/client';

import { 
  AggregatedQueryOptions,
  PermissionScope 
} from '../types/wallet.js';
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
export class AggregationService {
  private suiClient: SuiClient;
  private packageId: string;
  private permissionService: PermissionService;
  private contextWalletService: ContextWalletService;

  constructor(config: AggregationServiceConfig) {
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
  async query(options: AggregatedQueryOptions): Promise<AggregatedQueryResult> {
    const startTime = Date.now();
    const result: AggregatedQueryResult = {
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

    // Get all contexts for the specified apps
    const allContexts: Array<{ contextId: string; appId: string }> = [];
    
    for (const appId of options.apps) {
      try {
        // Derive context ID for this app and user
        const contextId = await this.deriveContextId(options.userAddress, appId);
        allContexts.push({ contextId, appId });
      } catch (error) {
        console.warn(`Failed to derive context for app ${appId}:`, error);
      }
    }

    result.metrics.contextsChecked = allContexts.length;

    // Check permissions and query allowed contexts
    for (const { contextId, appId } of allContexts) {
      try {
        // Check if the requesting entity has permission to access this context
        const hasPermission = await this.permissionService.checkPermission(
          appId,
          options.scope,
          options.userAddress
        );
        
        result.metrics.permissionChecks++;

        if (!hasPermission) {
          result.skippedContexts.push(contextId);
          continue;
        }

        // Query data from this context
        const contextData = await this.contextWalletService.listData(contextId, {
          limit: options.limit ? Math.ceil(options.limit / options.apps.length) : undefined
        });

        // Filter results based on query
        const filteredData = this.filterDataByQuery(contextData, options.query);

        if (filteredData.length > 0) {
          result.results.push({
            contextId,
            appId,
            data: filteredData,
            hasMore: false // TODO: Implement pagination
          });
          
          result.totalResults += filteredData.length;
          result.queriedContexts.push(contextId);
        }
      } catch (error) {
        console.error(`Error querying context ${contextId}:`, error);
        result.skippedContexts.push(contextId);
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
  async queryWithScopes(
    userAddress: string, 
    query: string, 
    scopes: PermissionScope[]
  ): Promise<AggregatedQueryResult> {
    // Get all user contexts
    const userContexts = await this.contextWalletService.listUserContexts(userAddress);
    
    // Filter contexts by permission scopes
    const allowedApps: string[] = [];
    
    for (const context of userContexts) {
      let hasAllScopes = true;
      
      for (const scope of scopes) {
        const hasScope = await this.permissionService.checkPermission(
          context.appId,
          scope,
          userAddress
        );
        
        if (!hasScope) {
          hasAllScopes = false;
          break;
        }
      }
      
      if (hasAllScopes) {
        allowedApps.push(context.appId);
      }
    }

    return await this.query({
      apps: allowedApps,
      userAddress,
      query,
      scope: scopes[0] // Use first scope as primary
    });
  }

  /**
   * Get aggregated statistics across contexts
   * @param userAddress - User address
   * @param appIds - Apps to include in statistics
   * @returns Aggregated statistics
   */
  async getAggregatedStats(userAddress: string, appIds: string[]): Promise<{
    totalContexts: number;
    totalItems: number;
    totalSize: number;
    categoryCounts: Record<string, number>;
    appBreakdown: Record<string, {
      items: number;
      size: number;
      lastActivity: number;
    }>;
  }> {
    const stats = {
      totalContexts: 0,
      totalItems: 0,
      totalSize: 0,
      categoryCounts: {} as Record<string, number>,
      appBreakdown: {} as Record<string, {
        items: number;
        size: number;
        lastActivity: number;
      }>
    };

    for (const appId of appIds) {
      try {
        const contextId = await this.deriveContextId(userAddress, appId);
        const contextStats = await this.contextWalletService.getContextStats(contextId);
        
        stats.totalContexts++;
        stats.totalItems += contextStats.itemCount;
        stats.totalSize += contextStats.totalSize;
        
        // Merge category counts
        for (const [category, count] of Object.entries(contextStats.categories)) {
          stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + count;
        }
        
        // App breakdown
        stats.appBreakdown[appId] = {
          items: contextStats.itemCount,
          size: contextStats.totalSize,
          lastActivity: contextStats.lastActivity
        };
      } catch (error) {
        console.error(`Error getting stats for app ${appId}:`, error);
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
  async search(userAddress: string, searchQuery: string, options?: {
    appIds?: string[];
    categories?: string[];
    limit?: number;
    minPermissionScope?: PermissionScope;
  }): Promise<AggregatedQueryResult> {
    const appIds = options?.appIds || [];
    
    // If no apps specified, get all user contexts
    if (appIds.length === 0) {
      const userContexts = await this.contextWalletService.listUserContexts(userAddress);
      appIds.push(...userContexts.map(c => c.appId));
    }

    return await this.query({
      apps: appIds,
      userAddress,
      query: searchQuery,
      scope: options?.minPermissionScope || 'read:memories' as PermissionScope,
      limit: options?.limit
    });
  }

  /**
   * Derive context ID (helper method)
   * @private
   */
  private async deriveContextId(userAddress: string, appId: string): Promise<string> {
    // This would normally use MainWalletService.deriveContextId
    // For now, create a simple deterministic ID
    const input = `${userAddress}|${appId}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return `0x${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`;
  }

  /**
   * Filter data by search query
   * @private
   */
  private filterDataByQuery(
    data: Array<{
      id: string;
      content: string;
      category?: string;
      metadata?: Record<string, any>;
      createdAt: number;
    }>,
    query: string
  ): typeof data {
    if (!query) return data;
    
    const lowerQuery = query.toLowerCase();
    
    return data.filter(item => 
      item.content.toLowerCase().includes(lowerQuery) ||
      item.category?.toLowerCase().includes(lowerQuery) ||
      Object.values(item.metadata || {}).some(value => 
        String(value).toLowerCase().includes(lowerQuery)
      )
    );
  }

  /**
   * Apply global result limit across contexts
   * @private
   */
  private applyGlobalLimit<T extends { data: any[] }>(
    results: T[],
    limit: number
  ): T[] {
    let totalCount = 0;
    const limitedResults: T[] = [];
    
    for (const result of results) {
      if (totalCount >= limit) break;
      
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