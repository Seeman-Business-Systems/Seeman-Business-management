import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import PaymentMethod from 'src/domain/sale/payment-method';
import SaleStatus from 'src/domain/sale/sale-status';

class UpdateSaleValidator {
  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod | null;

  @IsEnum(SaleStatus)
  @IsOptional()
  status?: SaleStatus;

  @IsInt()
  @IsPositive()
  @IsOptional()
  customerId?: number;
}

export default UpdateSaleValidator;
