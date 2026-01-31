import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import ReserveInventoryCommand from './reserve-inventory.command';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import ReservationStatus from 'src/domain/inventory/reservation-status';
import {
  InventoryNotFoundException,
  InsufficientInventoryException,
} from 'src/domain/inventory/exceptions';
import InventoryReservationRepository from 'src/infrastructure/database/repositories/inventory/inventory-reservation.repository';
import InventoryReservation from 'src/domain/inventory/inventory-reservation';

@CommandHandler(ReserveInventoryCommand)
class ReserveInventory implements ICommandHandler<ReserveInventoryCommand> {
  constructor(
    private inventories: InventoryRepository,
    private reservations: InventoryReservationRepository,
  ) {}

  async execute(
    command: ReserveInventoryCommand,
  ): Promise<InventoryReservation> {
    const inventory = await this.inventories.findByVariantAndWarehouse(
      command.variantId,
      command.warehouseId,
    );

    if (!inventory) {
      throw new InventoryNotFoundException(
        command.variantId,
        command.warehouseId,
      );
    }

    const availableQuantity = inventory.getAvailableQuantity();

    if (availableQuantity < command.quantity) {
      throw new InsufficientInventoryException(
        availableQuantity,
        command.quantity,
      );
    }

    // Create the inventory reservation
    const reservation = new InventoryReservation(
      undefined,
      command.variantId,
      command.warehouseId,
      command.orderId,
      command.customerId,
      command.quantity,
      command.reservedBy,
      new Date(),
      command.expiresAt,
      ReservationStatus.ACTIVE,
      command.notes,
      new Date(),
      new Date(),
    );

    const savedReservation = await this.reservations.commit(reservation);

    // Update inventory reserved quantity
    inventory.setReservedQuantity(
      inventory.getReservedQuantity() + command.quantity,
    );
    inventory.setUpdatedAt(new Date());
    await this.inventories.commit(inventory);

    return savedReservation;
  }
}

export default ReserveInventory;
