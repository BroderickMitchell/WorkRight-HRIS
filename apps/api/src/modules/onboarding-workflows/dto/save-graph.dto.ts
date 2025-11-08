// src/modules/onboarding-workflows/dto/save-graph.dto.ts
import { IsArray, ValidateNested, IsOptional, IsObject, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class WorkflowNodeDto {
  @IsString()
  id!: string;

  @IsString()
  type!: string;

  [key: string]: unknown;
}

export class WorkflowEdgeDto {
  @IsString()
  id!: string;

  @IsString()
  source!: string;

  @IsString()
  target!: string;

  [key: string]: unknown;
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
