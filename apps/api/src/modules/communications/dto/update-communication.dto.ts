import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested
} from 'class-validator';
import { AttachmentDto } from './attachment.dto.js';
import { MentionDto } from './mention.dto.js';

export class UpdateCommunicationPostDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20000)
  body?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MentionDto)
  mentions?: MentionDto[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : typeof value === 'string' ? [value] : value))
  targetTeamIds?: string[];

  @IsOptional()
  @IsDateString()
  ackDueAt?: string;
}
