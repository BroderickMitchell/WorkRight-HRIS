import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class PlanTravelDto {
  @IsString()
  employeeId!: string;

  @IsString()
  locationId!: string;

  @IsArray()
  @IsDateString({}, { each: true })
  swingDates!: string[]; // e.g., ["2024-11-04", "2024-11-12"]
}

export class ManifestQueryDto {
  @IsDateString()
  date!: string; // ISO day
}

export class OccupancyQueryDto {
  @IsString()
  locationId!: string;

  @IsDateString()
  date!: string;
}

