import { Command } from '@nestjs/cqrs';
import Inventory from 'src/domain/inventory/inventory';

class SetReorderLevelsCommand extends Command<Inventory> {
  constructor(
    public readonly inventoryId: number,
    public readonly minimumQuantity: number,
    public readonly maximumQuantity: number | null,
  ) {
    super();
  }
}

export default SetReorderLevelsCommand;