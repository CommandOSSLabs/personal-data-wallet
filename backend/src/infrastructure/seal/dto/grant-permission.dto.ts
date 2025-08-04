import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber } from 'class-validator';

export class GrantAppPermissionDto {
  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsNotEmpty()
  appAddress: string;

  @IsArray()
  @IsString({ each: true })
  dataIds: string[];

  @IsOptional()
  @IsNumber()
  expiresAt?: number; // Unix timestamp

  @IsOptional()
  @IsString()
  userSignature?: string; // User's signature to authorize the grant
}

export class RevokeAppPermissionDto {
  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsNotEmpty()
  permissionId: string;

  @IsOptional()
  @IsString()
  userSignature?: string;
}

export class EncryptForAppDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsNotEmpty()
  appAddress: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class DecryptAsAppDto {
  @IsString()
  @IsNotEmpty()
  encryptedContent: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string; // Original owner

  @IsString()
  @IsNotEmpty()
  appAddress: string; // App requesting decryption

  @IsString()
  @IsNotEmpty()
  appSignature: string; // App's signature for session key
}