import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

const toNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export class ListAckItemsQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? true : value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  onlyPending?: boolean;

  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @Min(1)
  @Max(50)
  take?: number;

  @IsOptional()
  cursor?: string;
}
