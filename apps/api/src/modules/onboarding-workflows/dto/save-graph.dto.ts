import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowNodeType } from '@prisma/client';

class NodePositionDto {
  @IsNumber()
  x!: number;

  @IsNumber()
  y!: number;
}

export class WorkflowNodeDto {
  @IsString()
  id!: string;

  @IsEnum(WorkflowNodeType)
  type!: WorkflowNodeType;

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsObject()
  settings!: Record<string, unknown>;

  @ValidateNested()
  @Type(() => NodePositionDto)
  position!: NodePositionDto;
}

export class WorkflowEdgeDto {
  @IsString()
  id!: string;

  @IsString()
  from!: string;

  @IsString()
  to!: string;

  @IsOptional()
  @IsString()
  label?: 'true' | 'false' | null;

  @IsOptional()
  @IsNumber()
  order?: number | null;
}

export class SaveGraphDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowNodeDto)
  nodes!: WorkflowNodeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowEdgeDto)
  edges!: WorkflowEdgeDto[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
