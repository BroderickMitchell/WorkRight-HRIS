import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED'
}

export class CreateLeaveRequestDto {
  @IsString()
  employeeId!: string;

  @IsString()
  leaveTypeId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLeaveStatusDto {
  @IsEnum(LeaveStatus)
  status!: LeaveStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
