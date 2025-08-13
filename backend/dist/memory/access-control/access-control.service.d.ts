import { SealService } from '../../infrastructure/seal/seal.service';
import { MemoryQueryService } from '../memory-query/memory-query.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { Memory } from '../../types/memory.types';
import { AccessPermission } from '../../infrastructure/seal/interfaces/seal.interfaces';
export declare class AccessControlService {
    private readonly sealService;
    private readonly memoryQueryService;
    private readonly suiService;
    private readonly logger;
    constructor(sealService: SealService, memoryQueryService: MemoryQueryService, suiService: SuiService);
    getAccessibleMemories(userAddress: string, includeOwnMemories?: boolean, includeDelegatedMemories?: boolean): Promise<{
        ownMemories: Memory[];
        delegatedMemories: Memory[];
        summary: {
            totalOwned: number;
            totalDelegated: number;
            totalAccessible: number;
        };
    }>;
    searchAccessibleMemories(userAddress: string, query: string, category?: string, k?: number): Promise<{
        results: Memory[];
        sources: {
            owned: Memory[];
            delegated: Memory[];
        };
    }>;
    grantBulkAccess(ownerAddress: string, delegatedAddress: string, resourceIds: string[], accessLevel?: 'read' | 'write' | 'admin', expiresAt?: number, metadata?: Record<string, any>): Promise<{
        successful: AccessPermission[];
        failed: Array<{
            resourceId: string;
            error: string;
        }>;
        summary: {
            granted: number;
            failed: number;
            total: number;
        };
    }>;
    revokeBulkAccess(revokerAddress: string, permissionIds: string[]): Promise<{
        successful: string[];
        failed: Array<{
            permissionId: string;
            error: string;
        }>;
        summary: {
            revoked: number;
            failed: number;
            total: number;
        };
    }>;
    getUserSharingAnalytics(userAddress: string): Promise<{
        ownedResources: {
            totalResources: number;
            totalSharedResources: number;
            uniqueUsersGrantedAccess: number;
            sharesByAccessLevel: Record<string, number>;
        };
        delegatedAccess: {
            totalPermissions: number;
            uniqueOwnersGrantingAccess: number;
            accessByLevel: Record<string, number>;
            expiringPermissions: number;
        };
    }>;
}
