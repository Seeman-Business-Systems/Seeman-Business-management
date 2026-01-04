import { IsString, IsNotEmpty, IsNumber, IsOptional, Length, Min, IsObject } from 'class-validator';

class CreateProductVariantValidator {
  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  @Length(3, 100, { message: 'SKU must be between 3 and 100 characters' })
  sku: string;

  @IsString()
  @IsNotEmpty({ message: 'Variant name is required' })
  @Length(2, 255, { message: 'Variant name must be between 2 and 255 characters' })
  variantName: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Selling price is required' })
  @Min(0, { message: 'Selling price must be a positive number' })
  sellingPrice: number;

  @IsOptional()
  @IsObject()
  specifications?: Record<string, any> | null;
}

export default CreateProductVariantValidator;