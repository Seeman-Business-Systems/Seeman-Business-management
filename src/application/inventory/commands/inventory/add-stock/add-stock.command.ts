import { Command } from '@nestjs/cqrs';
import Inventory from 'src/domain/inventory/inventory';

class AddStockCommand extends Command<Inventory> {
  constructor(
    public readonly variantId: number,
    public readonly warehouseId: number,
    public readonly quantity: number,
    public readonly notes: string | null,
    public readonly actorId: number,
  ) {
    super();
  }
}

export default AddStockCommand;
