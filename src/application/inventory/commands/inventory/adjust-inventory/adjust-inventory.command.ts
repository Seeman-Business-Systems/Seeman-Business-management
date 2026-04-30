import { Command } from '@nestjs/cqrs';
import Inventory from 'src/domain/inventory/inventory';

class AdjustInventoryCommand extends Command<Inventory> {
  constructor(
    public readonly variantId: number,
    public readonly warehouseId: number,
    public readonly adjustmentQuantity: number,
    public readonly notes: string,
    public readonly actorId: number,
  ) {
    super();
  }
}

export default AdjustInventoryCommand;
