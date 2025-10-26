import { IsObject, IsString } from 'class-validator';

export class RecordAuditDto {
  @IsString()
  entity!: string;

  @IsString()
  entityId!: string;

  @IsString()
  action!: string;

  @IsObject()
  changes!: Record<string, unknown>;
}

