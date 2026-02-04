import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsInt()
  @Min(0)
  ticket_price!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsInt()
  @IsPositive()
  threshold_count!: number;

  @IsOptional()
  end_date?: string;
}
