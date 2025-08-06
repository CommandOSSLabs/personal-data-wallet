import { IsNotEmpty, IsString } from 'class-validator';

export class PrepareIndexDto {
  @IsNotEmpty({ message: 'User address is required' })
  @IsString({ message: 'User address must be a string' })
  userAddress: string;
}

export class PrepareIndexResponseDto {
  success: boolean;
  indexBlobId?: string;
  graphBlobId?: string;
  message?: string;
}
