import { IsString, IsUrl } from 'class-validator';

export class RegisterWebhookDto {
  @IsString()
  event!: string;

  @IsUrl()
  targetUrl!: string;

  @IsString()
  signingKey!: string;
}
