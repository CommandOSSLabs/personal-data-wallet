import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSessionTitleDto {
  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsNotEmpty()
  title: string;
}