import { Injectable } from '@nestjs/common';
import Inventory from 'src/domain/inventory/inventory';
import InventoryEntity from '../../entities/inventory.entity';

@Injectable()
abstract class InventoryRepository {
  abstract findById(id: number): Promise<Inventory | null>;
  abstract findByVariantAndWarehouse(
    variantId: number,
    warehouseId: number,
  ): Promise<Inventory | null>;
  abstract findByWarehouse(warehouseId: number): Promise<Inventory[]>;
  abstract findByVariant(variantId: number): Promise<Inventory[]>;
  abstract findLowStock(warehouseId?: number): Promise<Inventory[]>;
  abstract findAll(): Promise<Inventory[]>;
  abstract commit(inventory: Inventory): Promise<Inventory>;
  abstract toDomain(entity: InventoryEntity): Inventory;
}

export default InventoryRepository;