import { Controller, Post, Get, Delete, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SealService } from './seal.service';

export class CreateAllowlistDto {
  name: string;
  description?: string;
  addresses: string[];
  userAddress: string;
}

export class UpdateAllowlistDto {
  name?: string;
  description?: string;
  addresses?: string[];
}

export class AllowlistAccessDto {
  allowlistId: string;
  content: string;
  userAddress: string;
}

export class AllowlistDecryptDto {
  encryptedData: string; // Base64 encoded
  userAddress: string;
}

export interface AllowlistPolicy {
  id: string;
  name: string;
  description?: string;
  addresses: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  memoryCount: number;
}

export interface AllowlistEncryptResponse {
  success: boolean;
  encryptedData: string; // Base64 encoded
  identityId: string;
  allowlistId: string;
}

export interface AllowlistDecryptResponse {
  success: boolean;
  content: string;
  decryptedAt: string;
}

@Controller('api/seal/allowlist')
export class AllowlistController {
  private readonly logger = new Logger(AllowlistController.name);
  private allowlists = new Map<string, AllowlistPolicy>(); // In-memory storage for demo

  constructor(private readonly sealService: SealService) {}

  /**
   * Create a new allowlist policy
   * POST /api/seal/allowlist
   */
  @Post()
  async createAllowlist(@Body() dto: CreateAllowlistDto): Promise<AllowlistPolicy> {
    try {
      this.logger.log(`Creating allowlist: ${dto.name} for user: ${dto.userAddress}`);

      // Validate addresses
      if (!dto.addresses || dto.addresses.length === 0) {
        throw new Error('At least one address is required');
      }

      // Validate Sui addresses (basic validation)
      const invalidAddresses = dto.addresses.filter(addr => 
        !addr.startsWith('0x') || addr.length !== 66
      );
      
      if (invalidAddresses.length > 0) {
        throw new Error(`Invalid Sui addresses: ${invalidAddresses.join(', ')}`);
      }

      const allowlistId = `allowlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const allowlist: AllowlistPolicy = {
        id: allowlistId,
        name: dto.name,
        description: dto.description,
        addresses: [...new Set(dto.addresses)], // Remove duplicates
        owner: dto.userAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        memoryCount: 0
      };

      this.allowlists.set(allowlistId, allowlist);

      this.logger.log(`Created allowlist: ${allowlistId} with ${allowlist.addresses.length} addresses`);
      return allowlist;
    } catch (error) {
      this.logger.error('Failed to create allowlist', error);
      throw new HttpException(
        `Failed to create allowlist: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get all allowlists for a user
   * GET /api/seal/allowlist/:userAddress
   */
  @Get(':userAddress')
  async getUserAllowlists(@Param('userAddress') userAddress: string): Promise<AllowlistPolicy[]> {
    try {
      const userAllowlists = Array.from(this.allowlists.values())
        .filter(allowlist => allowlist.owner === userAddress)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return userAllowlists;
    } catch (error) {
      this.logger.error('Failed to get user allowlists', error);
      throw new HttpException(
        'Failed to get allowlists',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update an allowlist
   * POST /api/seal/allowlist/:allowlistId/update
   */
  @Post(':allowlistId/update')
  async updateAllowlist(
    @Param('allowlistId') allowlistId: string,
    @Body() dto: UpdateAllowlistDto & { userAddress: string }
  ): Promise<AllowlistPolicy> {
    try {
      const allowlist = this.allowlists.get(allowlistId);
      
      if (!allowlist) {
        throw new HttpException('Allowlist not found', HttpStatus.NOT_FOUND);
      }

      if (allowlist.owner !== dto.userAddress) {
        throw new HttpException('Not authorized to update this allowlist', HttpStatus.FORBIDDEN);
      }

      // Update fields
      if (dto.name) allowlist.name = dto.name;
      if (dto.description !== undefined) allowlist.description = dto.description;
      if (dto.addresses) {
        // Validate new addresses
        const invalidAddresses = dto.addresses.filter(addr => 
          !addr.startsWith('0x') || addr.length !== 66
        );
        
        if (invalidAddresses.length > 0) {
          throw new Error(`Invalid Sui addresses: ${invalidAddresses.join(', ')}`);
        }
        
        allowlist.addresses = [...new Set(dto.addresses)];
      }
      
      allowlist.updatedAt = new Date().toISOString();
      this.allowlists.set(allowlistId, allowlist);

      this.logger.log(`Updated allowlist: ${allowlistId}`);
      return allowlist;
    } catch (error) {
      this.logger.error('Failed to update allowlist', error);
      throw new HttpException(
        error.message || 'Failed to update allowlist',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Toggle allowlist active status
   * POST /api/seal/allowlist/:allowlistId/toggle
   */
  @Post(':allowlistId/toggle')
  async toggleAllowlist(
    @Param('allowlistId') allowlistId: string,
    @Body() dto: { userAddress: string }
  ): Promise<AllowlistPolicy> {
    try {
      const allowlist = this.allowlists.get(allowlistId);
      
      if (!allowlist) {
        throw new HttpException('Allowlist not found', HttpStatus.NOT_FOUND);
      }

      if (allowlist.owner !== dto.userAddress) {
        throw new HttpException('Not authorized to modify this allowlist', HttpStatus.FORBIDDEN);
      }

      allowlist.isActive = !allowlist.isActive;
      allowlist.updatedAt = new Date().toISOString();
      this.allowlists.set(allowlistId, allowlist);

      this.logger.log(`Toggled allowlist ${allowlistId} to ${allowlist.isActive ? 'active' : 'inactive'}`);
      return allowlist;
    } catch (error) {
      this.logger.error('Failed to toggle allowlist', error);
      throw new HttpException(
        error.message || 'Failed to toggle allowlist',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Delete an allowlist
   * DELETE /api/seal/allowlist/:allowlistId
   */
  @Delete(':allowlistId')
  async deleteAllowlist(
    @Param('allowlistId') allowlistId: string,
    @Body() dto: { userAddress: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const allowlist = this.allowlists.get(allowlistId);
      
      if (!allowlist) {
        throw new HttpException('Allowlist not found', HttpStatus.NOT_FOUND);
      }

      if (allowlist.owner !== dto.userAddress) {
        throw new HttpException('Not authorized to delete this allowlist', HttpStatus.FORBIDDEN);
      }

      if (allowlist.memoryCount > 0) {
        throw new HttpException(
          `Cannot delete allowlist with ${allowlist.memoryCount} associated memories`,
          HttpStatus.BAD_REQUEST
        );
      }

      this.allowlists.delete(allowlistId);

      this.logger.log(`Deleted allowlist: ${allowlistId}`);
      return {
        success: true,
        message: 'Allowlist deleted successfully'
      };
    } catch (error) {
      this.logger.error('Failed to delete allowlist', error);
      throw new HttpException(
        error.message || 'Failed to delete allowlist',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Encrypt content with allowlist access control
   * POST /api/seal/allowlist/encrypt
   */
  @Post('encrypt')
  async encryptWithAllowlist(@Body() dto: AllowlistAccessDto): Promise<AllowlistEncryptResponse> {
    try {
      const allowlist = this.allowlists.get(dto.allowlistId);
      
      if (!allowlist) {
        throw new HttpException('Allowlist not found', HttpStatus.NOT_FOUND);
      }

      if (!allowlist.isActive) {
        throw new HttpException('Allowlist is not active', HttpStatus.BAD_REQUEST);
      }

      // Check if user is authorized (owner or in allowlist)
      if (allowlist.owner !== dto.userAddress && !allowlist.addresses.includes(dto.userAddress)) {
        throw new HttpException('Not authorized to use this allowlist', HttpStatus.FORBIDDEN);
      }

      // Create identity for allowlist access
      const identityId = `allowlist_${dto.allowlistId}_${Date.now()}`;
      const contentBytes = new TextEncoder().encode(dto.content);

      const result = await this.sealService.encrypt(contentBytes, identityId);

      // Update memory count
      allowlist.memoryCount++;
      this.allowlists.set(dto.allowlistId, allowlist);

      return {
        success: true,
        encryptedData: Buffer.from(result.encryptedObject).toString('base64'),
        identityId,
        allowlistId: dto.allowlistId,
      };
    } catch (error) {
      this.logger.error('Failed to encrypt with allowlist', error);
      throw new HttpException(
        error.message || 'Allowlist encryption failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Decrypt allowlist-protected content
   * POST /api/seal/allowlist/decrypt
   */
  @Post('decrypt')
  async decryptAllowlist(@Body() dto: AllowlistDecryptDto): Promise<AllowlistDecryptResponse> {
    try {
      // Extract allowlist ID from encrypted data (simplified - in real implementation, parse EncryptedObject)
      const allowlistMatch = dto.encryptedData.match(/allowlist_([^_]+)_/);
      
      if (!allowlistMatch) {
        throw new HttpException('Invalid allowlist encrypted data', HttpStatus.BAD_REQUEST);
      }

      const allowlistId = `allowlist_${allowlistMatch[1]}`;
      const allowlist = this.allowlists.get(allowlistId);
      
      if (!allowlist) {
        throw new HttpException('Allowlist not found', HttpStatus.NOT_FOUND);
      }

      if (!allowlist.isActive) {
        throw new HttpException('Allowlist is not active', HttpStatus.FORBIDDEN);
      }

      // Check if user is authorized
      if (allowlist.owner !== dto.userAddress && !allowlist.addresses.includes(dto.userAddress)) {
        throw new HttpException('Not authorized to decrypt this content', HttpStatus.FORBIDDEN);
      }

      // Decrypt content
      const encryptedBytes = new Uint8Array(Buffer.from(dto.encryptedData, 'base64'));
      const moveCallConstructor = this.sealService.createAllowlistAccessTransaction(
        dto.userAddress,
        allowlist.addresses
      );
      
      const decryptedBytes = await this.sealService.decrypt(encryptedBytes, moveCallConstructor);
      const content = new TextDecoder().decode(decryptedBytes);

      return {
        success: true,
        content,
        decryptedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to decrypt allowlist content', error);
      throw new HttpException(
        error.message || 'Allowlist decryption failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Check if user can access allowlist
   * POST /api/seal/allowlist/:allowlistId/check-access
   */
  @Post(':allowlistId/check-access')
  async checkAllowlistAccess(
    @Param('allowlistId') allowlistId: string,
    @Body() dto: { userAddress: string }
  ): Promise<{
    canAccess: boolean;
    isOwner: boolean;
    isInAllowlist: boolean;
    allowlistActive: boolean;
  }> {
    try {
      const allowlist = this.allowlists.get(allowlistId);
      
      if (!allowlist) {
        return {
          canAccess: false,
          isOwner: false,
          isInAllowlist: false,
          allowlistActive: false,
        };
      }

      const isOwner = allowlist.owner === dto.userAddress;
      const isInAllowlist = allowlist.addresses.includes(dto.userAddress);
      const canAccess = allowlist.isActive && (isOwner || isInAllowlist);

      return {
        canAccess,
        isOwner,
        isInAllowlist,
        allowlistActive: allowlist.isActive,
      };
    } catch (error) {
      this.logger.error('Failed to check allowlist access', error);
      return {
        canAccess: false,
        isOwner: false,
        isInAllowlist: false,
        allowlistActive: false,
      };
    }
  }
}
