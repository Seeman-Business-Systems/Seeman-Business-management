import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import CancelReservationCommand from './cancel-reservation.command';
import InventoryReservation from 'src/domain/inventory/inventory-reservation';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryReservationRepository from 'src/infrastructure/database/repositories/inventory/inventory-reservation.repository';
import {
  ReservationNotFoundException,
  ReservationNotActiveException,
} from 'src/domain/inventory/exceptions';

@CommandHandler(CancelReservationCommand)
class CancelReservation implements ICommandHandler<CancelReservationCommand> {
  constructor(
    private inventories: InventoryRepository,
    private reservations: InventoryReservationRepository,
  ) {}

  async execute(
    command: CancelReservationCommand,
  ): Promise<InventoryReservation> {
    const reservation = await this.reservations.findById(command.reservationId);

    if (!reservation) {
      throw new ReservationNotFoundException(command.reservationId);
    }

    if (!reservation.isActive()) {
      throw new ReservationNotActiveException(
        command.reservationId,
        reservation.getStatus().toString(),
      );
    }

    // Cancel the reservation
    reservation.cancel();
    const updatedReservation = await this.reservations.commit(reservation);

    // Update inventory reserved quantity
    const inventory = await this.inventories.findByVariantAndWarehouse(
      reservation.getVariantId(),
      reservation.getWarehouseId(),
    );

    if (inventory) {
      inventory.setReservedQuantity(
        inventory.getReservedQuantity() - reservation.getQuantity(),
      );
      inventory.setUpdatedAt(new Date());
      await this.inventories.commit(inventory);
    }

    return updatedReservation;
  }
}

export default CancelReservation;
