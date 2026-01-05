import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import CreateProductVariantCommand from './create-product-variant.command';
import ProductVariant from 'src/domain/product/product-variant';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';

@CommandHandler(CreateProductVariantCommand)
class CreateProductVariant implements ICommandHandler<CreateProductVariantCommand> {
  constructor(private variants: ProductVariantRepository) {}

  async execute(command: CreateProductVariantCommand): Promise<ProductVariant> {
    const variant = new ProductVariant(
      undefined,
      command.productId,
      command.sku,
      command.variantName,
      command.sellingPrice,
      command.specifications,
      command.createdBy,
      new Date(),
      new Date(),
    );

    return await this.variants.commit(variant);
  }
}

export default CreateProductVariant;
