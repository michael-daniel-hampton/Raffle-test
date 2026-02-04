import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class UpdateListingDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  category?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  ticket_price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsInt()
  @IsOptional()
  @IsPositive()
  threshold_count?: number;

  @IsOptional()
  end_date?: string;
}
