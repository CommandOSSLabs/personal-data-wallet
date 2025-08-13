import { SealService } from '../../infrastructure/seal/seal.service';
import { MemoryQueryService } from '../memory-query/memory-query.service';
import { GrantAccessDto, CheckAccessDto, DelegatedDecryptionDto, BatchDecryptionDto, AccessPermissionDto, UserPermissionsResponseDto, DelegatedMemoryQueryDto } from '../dto/access-control.dto';
export declare class AccessControlController {
    private readonly sealService;
    private readonly memoryQueryService;
    private readonly logger;
    constructor(sealService: SealService, memoryQueryService: MemoryQueryService);
    grantAccess(grantAccessDto: GrantAccessDto, ownerAddress: string): Promise<AccessPermissionDto>;
    revokeAccess(permissionId: string, revokerAddress: string): Promise<{
        message: string;
        success: boolean;
    }>;
    checkAccess(checkAccessDto: CheckAccessDto): Promise<{
        hasAccess: boolean;
        permission?: AccessPermissionDto;
    }>;
    decryptWithDelegatedAccess(delegatedDecryptionDto: DelegatedDecryptionDto): Promise<{
        content: string;
        accessGrantedBy: string;
        permissionId?: string;
        success: boolean;
    }>;
    batchDecrypt(batchDecryptionDto: BatchDecryptionDto): Promise<{
        results: Array<{
            content?: string;
            error?: string;
            index: number;
        }>;
        summary: {
            successful: number;
            failed: number;
            totalTime: number;
        };
    }>;
    getUserPermissions(userAddress: string): Promise<UserPermissionsResponseDto>;
    queryMemoriesWithDelegatedAccess(delegatedQueryDto: DelegatedMemoryQueryDto): Promise<{
        results: any[];
        summary: {
            accessible: number;
            denied: number;
            totalFound: number;
        };
    }>;
    private mapAccessPermissionToDto;
}
