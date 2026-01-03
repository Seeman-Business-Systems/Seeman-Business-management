import { Command } from '@nestjs/cqrs';
import InventoryBatch from 'src/domain/inventory/inventory-batch';

class CreateInventoryBatchCommand extends Command<InventoryBatch> {
  constructor(
    public readonly variantId: number,
    public readonly warehouseId: number,
    public readonly batchNumber: string,
    public readonly supplierId: number,
    public readonly quantityReceived: number,
    public readonly costPricePerUnit: number,
    public readonly expiryDate: Date | null,
    public readonly createdBy: number,
  ) {
    super();
  }
}

export default CreateInventoryBatchCommand;