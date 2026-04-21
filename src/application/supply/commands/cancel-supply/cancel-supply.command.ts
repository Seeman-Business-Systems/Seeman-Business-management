import { Command } from '@nestjs/cqrs';
import Supply from 'src/domain/supply/supply';

class CancelSupplyCommand extends Command<Supply> {
  constructor(
    public readonly supplyId: number,
    public readonly cancelledBy: number,
  ) {
    super();
  }
}

export default CancelSupplyCommand;
