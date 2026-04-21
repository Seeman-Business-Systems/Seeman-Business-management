import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import CreateProductCommand from './create-product.command';
import Product from 'src/domain/product/product';
import ProductRepository from 'src/infrastructure/database/repositories/product/product.repository';
import ProductCreated from 'src/domain/product/events/product-created.event';

@CommandHandler(CreateProductCommand)
class CreateProduct implements ICommandHandler<CreateProductCommand> {
  constructor(
    private products: ProductRepository,
    private eventBus: EventBus,
  ) {}

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

    const saved = await this.products.commit(product);

    this.eventBus.publish(
      new ProductCreated(saved.getId()!, saved.getName(), command.createdBy),
    );

    return saved;
  }
}

export default CreateProduct;
