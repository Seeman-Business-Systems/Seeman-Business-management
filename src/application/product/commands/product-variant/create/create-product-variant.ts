import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import CreateProductVariantCommand from './create-product-variant.command';
import ProductVariant from 'src/domain/product/product-variant';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import WarehouseRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.repository';
import Inventory from 'src/domain/inventory/inventory';

@CommandHandler(CreateProductVariantCommand)
class CreateProductVariant implements ICommandHandler<CreateProductVariantCommand> {
  constructor(
    private variants: ProductVariantRepository,
    private inventories: InventoryRepository,
    private warehouses: WarehouseRepository,
  ) {}

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

    const savedVariant = await this.variants.commit(variant);

    // Auto-create inventory records (qty 0) for all existing warehouses
    const allWarehouses = await this.warehouses.findAll();
    await Promise.all(
      allWarehouses.map((warehouse) => {
        const inventory = new Inventory(
          undefined,
          savedVariant.getId()!,
          warehouse.id!,
          0,
          0,
          null,
          0,
          new Date(),
          new Date(),
        );
        return this.inventories.commit(inventory);
      }),
    );

    return savedVariant;
  }
}

export default CreateProductVariant;
