// src/modules/positions/dto/create-job-role.dto.ts
import { IsString } from 'class-validator';

export class CreateJobRoleDto {
  @IsString()
  name!: string;
}
