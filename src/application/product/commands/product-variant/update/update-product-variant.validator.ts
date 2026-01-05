import { IsString, IsOptional, IsNumber, Length, Min, IsObject } from 'class-validator';

class UpdateProductVariantValidator {
  @IsOptional()
  @IsString()
  @Length(3, 100, { message: 'SKU must be between 3 and 100 characters' })
  sku?: string;

  @IsOptional()
  @IsString()
  @Length(2, 255, { message: 'Variant name must be between 2 and 255 characters' })
  variantName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Selling price must be a positive number' })
  sellingPrice?: number;

  @IsOptional()
  @IsObject()
  specifications?: Record<string, any> | null;
}

export default UpdateProductVariantValidator;