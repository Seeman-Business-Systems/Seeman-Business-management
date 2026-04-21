import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  IsEnum,
} from 'class-validator';
import PaymentMethod from 'src/domain/sale/payment-method';

class RecordSalePaymentValidator {
  @IsNumber()
  @IsNotEmpty({ message: 'Amount is required' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsEnum(PaymentMethod, { message: 'Payment method must be a valid value' })
  @IsNotEmpty({ message: 'Payment method is required' })
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export default RecordSalePaymentValidator;
