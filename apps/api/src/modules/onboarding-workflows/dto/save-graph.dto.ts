// src/modules/onboarding-workflows/dto/save-graph.dto.ts
import { IsArray, ValidateNested, IsOptional, IsObject, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class WorkflowNodeDto {
  @IsString()
  id!: string;

  @IsString()
  type!: string;

  // Add other fields as needed (label, data, position, etc.)
  // e.g. @IsOptional() @IsObject() data?: Record<string, unknown>;
}

export class WorkflowEdgeDto {
  @IsString()
  id!: string;

  @IsString()
  source!: string;

  @IsString()
  target!: string;

  // Add other fields as needed (label, conditions, etc.)
  // e.g. @IsOptional() @IsObject() data?: Record<string, unknown>;
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
