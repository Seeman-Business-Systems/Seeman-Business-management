import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import DeleteProductVariantCommand from './delete-product-variant.command';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';

@CommandHandler(DeleteProductVariantCommand)
class DeleteProductVariant implements ICommandHandler<DeleteProductVariantCommand> {
  constructor(private variants: ProductVariantRepository) {}

  async execute(command: DeleteProductVariantCommand): Promise<void> {
    await this.variants.delete(command.id);
  }
}

export default DeleteProductVariant;
