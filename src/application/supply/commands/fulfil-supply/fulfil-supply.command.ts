import { Command } from '@nestjs/cqrs';
import Supply from 'src/domain/supply/supply';

class FulfilSupplyCommand extends Command<Supply> {
  constructor(
    public readonly supplyId: number,
    public readonly fulfilledBy: number,
    public readonly notes: string | null = null,
  ) {
    super();
  }
}

export default FulfilSupplyCommand;
