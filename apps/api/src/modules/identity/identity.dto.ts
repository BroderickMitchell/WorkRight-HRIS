import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RoleKey } from '@prisma/client';

export class CreateTenantDto {
  @IsString()
  @MaxLength(64)
  name!: string;

  @IsString()
  @MaxLength(64)
  slug!: string;

  @IsBoolean()
  @IsOptional()
  maintenanceMode?: boolean;

  @IsString()
  @IsOptional()
  brandingPrimaryColor?: string;

  @IsString()
  @IsOptional()
  locale?: string;
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  givenName!: string;

  @IsString()
  familyName!: string;

  @IsString()
  tenantId!: string;

  @IsArray()
  @IsEnum(RoleKey, { each: true })
  roles!: RoleKey[];
}
