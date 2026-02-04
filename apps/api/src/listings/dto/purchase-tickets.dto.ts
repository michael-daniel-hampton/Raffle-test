import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class PurchaseTicketsDto {
  @IsInt()
  @IsPositive()
  qty!: number;

  @IsOptional()
  @IsString()
  idempotency_key?: string;
}
