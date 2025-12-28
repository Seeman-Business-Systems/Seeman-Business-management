import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import CreateProductCommand from './create-product.command';
import Product from 'src/domain/product/product';
import ProductRepository from 'src/infrastructure/database/repositories/product/product.repository';

@CommandHandler(CreateProductCommand)
class CreateProduct implements ICommandHandler<CreateProductCommand> {
  constructor(private products: ProductRepository) {}

  async execute(command: CreateProductCommand): Promise<Product> {
    const product = new Product(
      undefined,
      command.name,
      command.description,
      command.productType,
      command.status,
      command.brandId,
      command.categoryId,
      command.createdBy,
      new Date(),
      new Date(),
    );

    return await this.products.commit(product);
  }
}

export default CreateProduct;
