import { Command } from '@nestjs/cqrs';
import ProductVariant from 'src/domain/product/product-variant';

class UpdateProductVariantCommand extends Command<ProductVariant> {
  constructor(
    public readonly id: number,
    public readonly sku?: string,
    public readonly variantName?: string,
    public readonly sellingPrice?: number,
    public readonly specifications?: Record<string, any> | null,
  ) {
    super();
  }
}

export default UpdateProductVariantCommand;
