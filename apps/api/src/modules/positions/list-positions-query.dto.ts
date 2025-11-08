// src/modules/positions/dto/list-positions-query.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class ListPositionsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
