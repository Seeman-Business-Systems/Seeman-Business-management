import { Command } from '@nestjs/cqrs';
import StockReservation from 'src/domain/inventory/stock-reservation';

class UpdateReservationCommand extends Command<StockReservation> {
  constructor(
    public readonly reservationId: number,
    public readonly quantity?: number,
    public readonly orderId?: number | null,
    public readonly customerId?: number | null,
    public readonly expiresAt?: Date | null,
    public readonly notes?: string | null,
  ) {
    super();
  }
}

export default UpdateReservationCommand;
