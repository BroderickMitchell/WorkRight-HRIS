import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  deliveryType?: string;
}

export class AssignCourseDto {
  @IsArray()
  assigneeIds!: string[];

  @IsOptional()
  @IsString()
  dueDate?: string;
}
