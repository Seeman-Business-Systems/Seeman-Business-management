import { Command } from '@nestjs/cqrs';
import Product from 'src/domain/product/product';
import ProductType from 'src/domain/product/product-type';
import ProductStatus from 'src/domain/product/product-status';

class CreateProductCommand extends Command<Product> {
  constructor(
    public readonly name: string,
    public readonly description: string | null,
    public readonly productType: ProductType,
    public readonly status: ProductStatus,
    public readonly brandId: number,
    public readonly categoryId: number,
    public readonly createdBy: number,
  ) {
    super();
  }
}

export default CreateProductCommand;
