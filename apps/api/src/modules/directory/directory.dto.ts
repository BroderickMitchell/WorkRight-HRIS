import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  givenName!: string;

  @IsString()
  familyName!: string;

  @IsEmail()
  email!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsString()
  positionId!: string;
}
