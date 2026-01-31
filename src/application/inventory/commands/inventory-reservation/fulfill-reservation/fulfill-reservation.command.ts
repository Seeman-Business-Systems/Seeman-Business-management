import { Command } from '@nestjs/cqrs';
import InventoryReservation from 'src/domain/inventory/inventory-reservation';

class FulfillReservationCommand extends Command<InventoryReservation> {
  constructor(public readonly reservationId: number) {
    super();
  }
}

export default FulfillReservationCommand;
