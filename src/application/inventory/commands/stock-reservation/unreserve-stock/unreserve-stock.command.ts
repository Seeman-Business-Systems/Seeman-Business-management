import { Command } from '@nestjs/cqrs';
import StockReservation from 'src/domain/inventory/stock-reservation';

class UnreserveStockCommand extends Command<StockReservation> {
  constructor(public readonly reservationId: number) {
    super();
  }
}

export default UnreserveStockCommand;