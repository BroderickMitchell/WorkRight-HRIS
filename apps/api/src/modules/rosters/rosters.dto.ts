import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateRosterTemplateDto {
  @IsString()
  name!: string;

  @IsDateString()
  seedDate!: string; // ISO date

  @IsArray()
  pattern!: string[]; // e.g. ["D","D","D","D","D","D","D","D","R","R","R","R","R","R"]
}

export class AssignRosterDto {
  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsDateString()
  effectiveFrom!: string; // ISO date

  @IsOptional()
  @IsDateString()
  effectiveTo?: string; // ISO date
}

export class GenerateShiftsDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;

  @IsOptional()
  @IsString()
  employeeId?: string;
}

export interface ShiftVm {
  id: string;
  employeeId: string;
  date: string; // ISO date
  shiftType: string; // DAY | REST | NIGHT (future)
}

