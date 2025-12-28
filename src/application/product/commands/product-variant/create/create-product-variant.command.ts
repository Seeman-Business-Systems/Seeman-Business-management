import { Command } from '@nestjs/cqrs';
import ProductVariant from 'src/domain/product/product-variant';

class CreateProductVariantCommand extends Command<ProductVariant> {
  constructor(
    public readonly productId: number,
    public readonly sku: string,
    public readonly variantName: string,
    public readonly price: number,
    public readonly specifications: Record<string, any> | null,
    public readonly createdBy: number,
  ) {
    super();
  }
}

export default CreateProductVariantCommand;
