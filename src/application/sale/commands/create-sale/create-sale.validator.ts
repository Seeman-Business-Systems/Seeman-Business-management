import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import PaymentMethod from 'src/domain/sale/payment-method';

class CreateSaleLineItemValidator {
  @IsNumber()
  @IsNotEmpty({ message: 'Variant ID is required' })
  variantId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Quantity is required' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Unit price is required' })
  @Min(0, { message: 'Unit price must be at least 0' })
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Discount amount must be at least 0' })
  discountAmount?: number;
}

class CreateSaleValidator {
  @IsNumber()
  @IsNotEmpty({ message: 'Branch ID is required' })
  branchId: number;

  @IsEnum(PaymentMethod, { message: 'Payment method must be a valid value' })
  @IsNotEmpty({ message: 'Payment method is required' })
  paymentMethod: PaymentMethod;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one line item is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleLineItemValidator)
  lineItems: CreateSaleLineItemValidator[];

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Discount amount must be at least 0' })
  discountAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export default CreateSaleValidator;
