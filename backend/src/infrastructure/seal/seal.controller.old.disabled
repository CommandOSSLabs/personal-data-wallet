import { Controller, Post, Get, Delete, Body, Query, Param } from '@nestjs/common';
import { SealIBEService } from './seal-ibe.service';
import { 
  GrantAppPermissionDto, 
  RevokeAppPermissionDto, 
  EncryptForAppDto, 
  DecryptAsAppDto 
} from './dto/grant-permission.dto';
import { IdentityType, IdentityOptions } from './identity-types';

@Controller('seal/ibe')
export class SealIBEController {
  constructor(private readonly sealIBEService: SealIBEService) {}

  /**
   * Grant an app permission to access user's data
   */
  @Post('permissions/grant')
  async grantPermission(@Body() dto: GrantAppPermissionDto) {
    return this.sealIBEService.grantAppPermission(
      dto.userAddress,
      dto.appAddress,
      dto.dataIds,
      dto.expiresAt
    );
  }

  /**
   * Revoke an app's permission
   */
  @Delete('permissions/:permissionId')
  async revokePermission(
    @Param('permissionId') permissionId: string,
    @Body() dto: RevokeAppPermissionDto
  ) {
    const success = await this.sealIBEService.revokeAppPermission(
      dto.userAddress,
      permissionId
    );
    return { success };
  }

  /**
   * List all permissions granted by a user
   */
  @Get('permissions')
  async listPermissions(@Query('userAddress') userAddress: string) {
    return this.sealIBEService.listAppPermissions(userAddress);
  }

  /**
   * Encrypt content specifically for an app
   */
  @Post('encrypt-for-app')
  async encryptForApp(@Body() dto: EncryptForAppDto) {
    const result = await this.sealIBEService.encryptForApp(
      dto.content,
      dto.userAddress,
      dto.appAddress
    );

    return {
      success: true,
      encrypted: result.encrypted,
      backupKey: result.backupKey,
      appAddress: result.appAddress,
      identityString: result.identityString,
      category: dto.category
    };
  }

  /**
   * Decrypt content as an authorized app
   */
  @Post('decrypt-as-app')
  async decryptAsApp(@Body() dto: DecryptAsAppDto) {
    try {
      const identityOptions: IdentityOptions = {
        type: IdentityType.APP,
        userAddress: dto.userAddress,
        targetAddress: dto.appAddress
      };

      const decrypted = await this.sealIBEService.decryptWithIdentity(
        dto.encryptedContent,
        identityOptions,
        dto.appSignature
      );

      return {
        success: true,
        content: decrypted
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Encrypt with time-lock
   */
  @Post('encrypt-timelock')
  async encryptWithTimelock(
    @Body() body: {
      content: string;
      userAddress: string;
      expiresAt: number;
    }
  ) {
    const result = await this.sealIBEService.encryptWithTimelock(
      body.content,
      body.userAddress,
      body.expiresAt
    );

    return {
      success: true,
      encrypted: result.encrypted,
      backupKey: result.backupKey,
      expiresAt: result.expiresAt,
      identityString: result.identityString
    };
  }

  /**
   * Get session message for app
   */
  @Post('app-session-message')
  async getAppSessionMessage(@Body() dto: { appAddress: string }) {
    const messageBytes = await this.sealIBEService.getSessionKeyMessage(dto.appAddress);
    const message = Buffer.from(messageBytes).toString('hex');
    return { message };
  }
}