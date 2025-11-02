import { IsNotEmpty, IsString } from 'class-validator';

export class MentionDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
