import { IsNumber, IsOptional, Min, IsString, IsDateString } from 'class-validator';

class UpdateReservationValidator {
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity?: number;

  @IsOptional()
  @IsNumber()
  orderId?: number | null;

  @IsOptional()
  @IsNumber()
  customerId?: number | null;

  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

export default UpdateReservationValidator;