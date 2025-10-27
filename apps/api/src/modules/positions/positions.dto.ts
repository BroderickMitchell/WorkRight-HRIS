import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  title!: string;

  @IsString()
  departmentId!: string;

  @IsString()
  orgUnitId!: string;

  @IsString()
  employmentType!: string; // e.g., Full-time, Part-time, Casual

  @IsString()
  workType!: string; // e.g., Permanent, Fixed-term

  @IsNumber()
  @Min(0.1)
  @Max(1)
  fte!: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  reportsToId?: string;

  @IsEnum(['BUDGETED', 'UNBUDGETED'] as any)
  budgetStatus!: 'BUDGETED' | 'UNBUDGETED';

  @IsOptional()
  @IsString()
  justification?: string;

  @IsDateString()
  effectiveFrom!: string;
}

export class EditPositionDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() orgUnitId?: string;
  @IsOptional() @IsString() employmentType?: string;
  @IsOptional() @IsString() workType?: string;
  @IsOptional() @IsNumber() @Min(0.1) @Max(1) fte?: number;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() reportsToId?: string;
  @IsOptional() @IsEnum(['BUDGETED', 'UNBUDGETED'] as any) budgetStatus?: 'BUDGETED' | 'UNBUDGETED';
  @IsOptional() @IsString() justification?: string;
  @IsOptional() @IsDateString() effectiveFrom?: string;
  @IsOptional() @IsDateString() effectiveTo?: string;
}

export class SubmitPositionDto {
  @IsBoolean()
  autoActivate?: boolean = false;
}

export class ApprovePositionDto {
  @IsString()
  stepId!: string;

  @IsEnum(['approve', 'reject'] as any)
  action!: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  comment?: string;
}

