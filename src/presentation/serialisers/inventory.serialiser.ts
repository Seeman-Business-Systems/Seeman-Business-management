import { Injectable } from '@nestjs/common';
import Inventory from 'src/domain/inventory/inventory';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';
import WarehouseRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.repository';
import ProductSerialiser from './product.serialiser';
import WarehouseSerialiser from './warehouse.serialiser';

@Injectable()
class InventorySerialiser {
  constructor(
    private readonly variants: ProductVariantRepository,
    private readonly warehouses: WarehouseRepository,
    private readonly productSerialiser: ProductSerialiser,
    private readonly warehouseSerialiser: WarehouseSerialiser,
  ) {}

  async serialise(inventory: Inventory) {
    const variant = await this.variants.findById(inventory.getVariantId());
    const warehouse = await this.warehouses.findById(inventory.getWarehouseId());

    return {
      id: inventory.getId(),
      variantId: inventory.getVariantId(),
      warehouseId: inventory.getWarehouseId(),
      variant: variant ? await this.productSerialiser.serialiseVariant(variant) : null,
      warehouse: warehouse ? await this.warehouseSerialiser.serialise(warehouse) : null,
      totalQuantity: inventory.getTotalQuantity(),
      minimumQuantity: inventory.getMinimumQuantity(),
      maximumQuantity: inventory.getMaximumQuantity(),
      reservedQuantity: inventory.getReservedQuantity(),
      availableQuantity: inventory.getAvailableQuantity(),
      isLowStock: inventory.isLowStock(),
      createdAt: inventory.getCreatedAt(),
      updatedAt: inventory.getUpdatedAt(),
    };
  }

  async serialiseMany(inventories: Inventory[]) {
    return Promise.all(inventories.map((inventory) => this.serialise(inventory)));
  }
}

export default InventorySerialiser;