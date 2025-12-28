import { IsString, IsOptional, IsNumber, IsEnum, Length } from 'class-validator';
import ProductType from 'src/domain/product/product-type';
import ProductStatus from 'src/domain/product/product-status';

class UpdateProductValidator {
  @IsOptional()
  @IsString()
  @Length(2, 255, { message: 'Product name must be between 2 and 255 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEnum(ProductType, { message: 'Invalid product type' })
  productType?: ProductType;

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Invalid product status' })
  status?: ProductStatus;

  @IsOptional()
  @IsNumber()
  brandId?: number;

  @IsOptional()
  @IsNumber()
  categoryId?: number;
}

export default UpdateProductValidator;