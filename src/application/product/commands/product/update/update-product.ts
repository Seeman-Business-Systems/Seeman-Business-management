import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import UpdateProductCommand from './update-product.command';
import Product from 'src/domain/product/product';
import ProductRepository from 'src/infrastructure/database/repositories/product/product.repository';

@CommandHandler(UpdateProductCommand)
class UpdateProduct implements ICommandHandler<UpdateProductCommand> {
  constructor(private products: ProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<Product> {
    const product = await this.products.findById(command.id);
    if (!product) {
      throw new Error(`Product with id ${command.id} not found`);
    }

    if (command.name !== undefined) {
      product.setName(command.name);
    }

    if (command.description !== undefined) {
      product.setDescription(command.description);
    }

    if (command.productType !== undefined) {
      product.setProductType(command.productType);
    }

    if (command.status !== undefined) {
      product.setStatus(command.status);
    }

    if (command.brandId !== undefined) {
      product.setBrandId(command.brandId);
    }

    if (command.categoryId !== undefined) {
      product.setCategoryId(command.categoryId);
    }

    product.setUpdatedAt(new Date());

    return await this.products.commit(product);
  }
}

export default UpdateProduct;
