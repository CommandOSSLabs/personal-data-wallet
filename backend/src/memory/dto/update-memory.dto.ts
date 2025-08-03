import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateMemoryDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;
}