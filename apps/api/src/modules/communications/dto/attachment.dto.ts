import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class AttachmentDto {
  @IsUrl()
  url!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  type?: string;
}
