import { Command } from '@nestjs/cqrs';
import Sale from 'src/domain/sale/sale';

class CancelSaleCommand extends Command<Sale> {
  constructor(
    public readonly saleId: number,
    public readonly cancelledBy: number,
  ) {
    super();
  }
}

export default CancelSaleCommand;
