import { Command } from '@nestjs/cqrs';
import Inventory from 'src/domain/inventory/inventory';

class ReserveStockCommand extends Command<Inventory> {
  constructor(
    public readonly inventoryId: number,
    public readonly quantity: number,
  ) {
    super();
  }
}

export default ReserveStockCommand;