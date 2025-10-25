import { IsArray, IsDateString, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate!: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  weighting!: number;

  @IsOptional()
  @IsString()
  parentGoalId?: string;

  @IsString()
  ownerId!: string;
}

export class CreateReviewCycleDto {
  @IsString()
  name!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsArray()
  participantIds!: string[];
}
