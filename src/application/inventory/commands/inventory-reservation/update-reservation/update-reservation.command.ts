import { Command } from '@nestjs/cqrs';
import InventoryReservation from 'src/domain/inventory/inventory-reservation';

class UpdateReservationCommand extends Command<InventoryReservation> {
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
