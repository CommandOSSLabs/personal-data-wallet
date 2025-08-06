import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterIndexDto {
  @IsNotEmpty({ message: 'User address is required' })
  @IsString({ message: 'User address must be a string' })
  userAddress: string;
  
  @IsNotEmpty({ message: 'Index ID is required' })
  @IsString({ message: 'Index ID must be a string' })
  indexId: string; // The on-chain memory index ID created by the frontend
}
