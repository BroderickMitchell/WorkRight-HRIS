import { IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreatePayrollRunDto {
  @IsDateString()
  periodStart!: string;

  @IsDateString()
  periodEnd!: string;

  @IsOptional()
  @IsString()
  locationId?: string;
}

export class UpsertPayProfileDto {
  @IsString()
  employeeId!: string;

  @IsInt()
  @IsPositive()
  baseRateCents!: number;
}
