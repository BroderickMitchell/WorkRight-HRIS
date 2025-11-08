// src/modules/positions/dto/org-chart-query.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class OrgChartQueryDto {
  @IsOptional()
  @IsString()
  rootId?: string;
}
