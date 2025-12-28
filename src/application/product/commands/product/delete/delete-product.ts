import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import DeleteProductCommand from './delete-product.command';
import ProductRepository from 'src/infrastructure/database/repositories/product/product.repository';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';

@CommandHandler(DeleteProductCommand)
class DeleteProduct implements ICommandHandler<DeleteProductCommand> {
  constructor(
    private products: ProductRepository,
    private variants: ProductVariantRepository,
  ) {}

  async execute(command: DeleteProductCommand): Promise<void> {
    // First, soft delete all variants associated with the product
    const productVariants = await this.variants.findByProductId(command.id);
    for (const variant of productVariants) {
      await this.variants.delete(variant.getId()!);
    }

    // Then soft delete the product
    await this.products.delete(command.id);
  }
}

export default DeleteProduct;
