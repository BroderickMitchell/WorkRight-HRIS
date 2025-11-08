// src/modules/positions/dto/update-position-config.dto.ts
import { IsObject } from 'class-validator';

export class UpdatePositionConfigDto {
  @IsObject()
  // widen as needed
  [key: string]: unknown;
}
