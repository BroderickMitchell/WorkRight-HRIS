// src/modules/positions/dto/update-job-role.dto.ts
import { IsString } from 'class-validator';

export class UpdateJobRoleDto {
  @IsString()
  name!: string;
}
