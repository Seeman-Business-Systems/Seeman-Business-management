import { Command } from '@nestjs/cqrs';
import StockReservation from 'src/domain/inventory/stock-reservation';

class ReserveStockCommand extends Command<StockReservation> {
  constructor(
    public readonly variantId: number,
    public readonly warehouseId: number,
    public readonly quantity: number,
    public readonly orderId: number | null,
    public readonly customerId: number | null,
    public readonly reservedBy: number,
    public readonly expiresAt: Date | null,
    public readonly notes: string | null,
  ) {
    super();
  }
}

export default ReserveStockCommand;