import { Injectable } from '@nestjs/common';
import Inventory from 'src/domain/inventory/inventory';

@Injectable()
class InventorySerialiser {
  async serialise(inventory: Inventory) {
    return {
      id: inventory.getId(),
      variantId: inventory.getVariantId(),
      warehouseId: inventory.getWarehouseId(),
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