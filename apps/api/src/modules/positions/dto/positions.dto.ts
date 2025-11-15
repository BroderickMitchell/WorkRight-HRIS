import { PositionManagementMode } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

const toNumber = ({ value }: { value: unknown }) => (value === undefined || value === null ? value : Number(value));
const toBoolean = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null) return value as undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return value;
};

const POSITION_MANAGEMENT_MODE = {
  EMPLOYEE_LED: 'EMPLOYEE_LED',
  POSITION_LED: 'POSITION_LED'
} as const satisfies Record<string, PositionManagementMode>;

export class CreatePositionDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsString()
  jobRoleId?: string;

  @IsString()
  departmentId!: string;

  @IsString()
  locationId!: string;

  @IsOptional()
  @IsString()
  parentPositionId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  headcount: number = 1;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(0)
  @Max(9.99)
  budgetedFte?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(0)
  budgetedSalary?: number;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  inheritRoleData: boolean = true;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive: boolean = true;
}

export class UpdatePositionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsString()
  jobRoleId?: string | null;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  parentPositionId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  headcount?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(0)
  @Max(9.99)
  budgetedFte?: number | null;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(0)
  budgetedSalary?: number | null;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  inheritRoleData?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;
}

export class AssignUserDto {
  @IsString()
  employeeId!: string;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(0)
  @Max(9.99)
  fte?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  @Min(0)
  baseSalary?: number;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsString()
  reportsToOverrideId?: string;
}

export class ListPositionsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  includeInactive?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  includeVacancies?: boolean;
}

export class UpdatePositionConfigDto {
  @IsOptional()
  @IsEnum(POSITION_MANAGEMENT_MODE)
  mode?: PositionManagementMode;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  showPositionIds?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  autoGeneratePositionIds?: boolean;

  @IsOptional()
  @IsString()
  positionIdFormat?: 'number' | 'prefix' | 'suffix' | 'initials';

  @IsOptional()
  @IsString()
  idPrefix?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  startingNumber?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  nextSequenceNumber?: number;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  enableBudgeting?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  enableConcurrentPositions?: boolean;
}

export class CreateJobRoleDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  courses?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competencies?: string[];
}

export class UpdateJobRoleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[] | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[] | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  courses?: string[] | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competencies?: string[] | null;
}

export class OrgChartQueryDto {
  @IsOptional()
  @IsString()
  rootId?: string;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  includeInactive?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  includeVacant?: boolean;
}
