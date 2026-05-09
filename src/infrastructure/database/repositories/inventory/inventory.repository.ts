import { Injectable } from '@nestjs/common';
import Inventory from 'src/domain/inventory/inventory';
import TransactionContext from 'src/application/shared/transactions/transaction-context';
import InventoryEntity from '../../entities/inventory.entity';

@Injectable()
abstract class InventoryRepository {
  abstract findById(id: number): Promise<Inventory | null>;
  abstract findByVariantAndWarehouse(
    variantId: number,
    warehouseId: number,
    tx?: TransactionContext,
  ): Promise<Inventory | null>;
  abstract findByVariantAndWarehouseForUpdate(
    variantId: number,
    warehouseId: number,
    tx: TransactionContext,
  ): Promise<Inventory | null>;
  abstract findByWarehouse(warehouseId: number): Promise<Inventory[]>;
  abstract findByVariant(variantId: number): Promise<Inventory[]>;
  abstract findLowInventory(warehouseId?: number): Promise<Inventory[]>;
  abstract findAll(): Promise<Inventory[]>;
  abstract commit(inventory: Inventory, tx?: TransactionContext): Promise<Inventory>;
  abstract toDomain(entity: InventoryEntity): Inventory;
}

export default InventoryRepository;
