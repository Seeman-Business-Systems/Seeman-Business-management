import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import UpdateProductVariantCommand from './update-product-variant.command';
import ProductVariant from 'src/domain/product/product-variant';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';

@CommandHandler(UpdateProductVariantCommand)
class UpdateProductVariant implements ICommandHandler<UpdateProductVariantCommand> {
  constructor(private variants: ProductVariantRepository) {}

  async execute(command: UpdateProductVariantCommand): Promise<ProductVariant> {
    const variant = await this.variants.findById(command.id);
    if (!variant) {
      throw new Error(`Product variant with id ${command.id} not found`);
    }

    if (command.sku !== undefined) {
      variant.setSku(command.sku);
    }

    if (command.variantName !== undefined) {
      variant.setVariantName(command.variantName);
    }

    if (command.price !== undefined) {
      variant.setPrice(command.price);
    }

    if (command.specifications !== undefined) {
      variant.setSpecifications(command.specifications);
    }

    variant.setUpdatedAt(new Date());

    return await this.variants.commit(variant);
  }
}

export default UpdateProductVariant;
