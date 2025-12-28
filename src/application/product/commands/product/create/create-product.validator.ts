import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Length } from 'class-validator';
import ProductType from 'src/domain/product/product-type';
import ProductStatus from 'src/domain/product/product-status';

class CreateProductValidator {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  @Length(2, 255, { message: 'Product name must be between 2 and 255 characters' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsEnum(ProductType, { message: 'Invalid product type' })
  @IsNotEmpty({ message: 'Product type is required' })
  productType: ProductType;

  @IsEnum(ProductStatus, { message: 'Invalid product status' })
  @IsNotEmpty({ message: 'Product status is required' })
  status: ProductStatus;

  @IsNumber()
  @IsNotEmpty({ message: 'Brand ID is required' })
  brandId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: number;
}

export default CreateProductValidator;