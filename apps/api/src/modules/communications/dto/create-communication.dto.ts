import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested
} from 'class-validator';
import { AttachmentDto } from './attachment.dto.js';
import { MentionDto } from './mention.dto.js';

const trim = (value: unknown) => (typeof value === 'string' ? value.trim() : value);

export class CreateCommunicationPostDto {
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => trim(value))
  title!: string;

  @IsString()
  @Length(1, 20000)
  body!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  targetTeamIds!: string[];

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
  @IsBoolean()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  requireAck?: boolean;

  @IsOptional()
  @IsDateString()
  ackDueAt?: string;
}
