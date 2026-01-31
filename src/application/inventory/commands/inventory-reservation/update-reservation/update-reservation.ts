import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import UpdateReservationCommand from './update-reservation.command';
import InventoryReservation from 'src/domain/inventory/inventory-reservation';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryReservationRepository from 'src/infrastructure/database/repositories/inventory/inventory-reservation.repository';
import {
  ReservationNotFoundException,
  ReservationNotActiveException,
  InventoryNotFoundException,
  InsufficientInventoryException,
} from 'src/domain/inventory/exceptions';

@CommandHandler(UpdateReservationCommand)
class UpdateReservation implements ICommandHandler<UpdateReservationCommand> {
  constructor(
    private inventories: InventoryRepository,
    private reservations: InventoryReservationRepository,
  ) {}

  async execute(
    command: UpdateReservationCommand,
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

    // If quantity is being changed, we need to update inventory reserved quantity
    if (
      command.quantity !== undefined &&
      command.quantity !== reservation.getQuantity()
    ) {
      const inventory = await this.inventories.findByVariantAndWarehouse(
        reservation.getVariantId(),
        reservation.getWarehouseId(),
      );

      if (!inventory) {
        throw new InventoryNotFoundException(
          reservation.getVariantId(),
          reservation.getWarehouseId(),
        );
      }

      const quantityDifference = command.quantity - reservation.getQuantity();
      const availableQuantity = inventory.getAvailableQuantity();

      // If increasing quantity, check if enough inventory is available
      if (quantityDifference > 0 && availableQuantity < quantityDifference) {
        throw new InsufficientInventoryException(
          availableQuantity,
          quantityDifference,
        );
      }

      // Update inventory reserved quantity
      inventory.setReservedQuantity(
        inventory.getReservedQuantity() + quantityDifference,
      );
      inventory.setUpdatedAt(new Date());
      await this.inventories.commit(inventory);

      // Update reservation quantity
      reservation.setQuantity(command.quantity);
    }

    // Update other fields
    if (command.orderId !== undefined) {
      reservation.setOrderId(command.orderId);
    }

    if (command.customerId !== undefined) {
      reservation.setCustomerId(command.customerId);
    }

    if (command.expiresAt !== undefined) {
      reservation.setExpiresAt(command.expiresAt);
    }

    if (command.notes !== undefined) {
      reservation.setNotes(command.notes);
    }

    reservation.setUpdatedAt(new Date());

    return await this.reservations.commit(reservation);
  }
}

export default UpdateReservation;
