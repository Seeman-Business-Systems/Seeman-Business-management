import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import FulfillReservationCommand from './fulfill-reservation.command';
import StockReservation from 'src/domain/inventory/stock-reservation';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import StockReservationRepository from 'src/infrastructure/database/repositories/inventory/stock-reservation.repository';
import {
  ReservationNotFoundException,
  ReservationNotActiveException,
} from 'src/domain/inventory/exceptions';

@CommandHandler(FulfillReservationCommand)
class FulfillReservation implements ICommandHandler<FulfillReservationCommand> {
  constructor(
    private inventories: InventoryRepository,
    private reservations: StockReservationRepository,
  ) {}

  async execute(command: FulfillReservationCommand): Promise<StockReservation> {
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

    // Mark reservation as fulfilled
    reservation.fulfill();
    const updatedReservation = await this.reservations.commit(reservation);

    // Update inventory reserved quantity (reduce it since the stock is now sold/used)
    const inventory = await this.inventories.findByVariantAndWarehouse(
      reservation.getVariantId(),
      reservation.getWarehouseId(),
    );

    if (inventory) {
      // Reduce both reserved and total quantity
      inventory.setReservedQuantity(
        inventory.getReservedQuantity() - reservation.getQuantity(),
      );
      inventory.setTotalQuantity(
        inventory.getTotalQuantity() - reservation.getQuantity(),
      );
      inventory.setUpdatedAt(new Date());
      await this.inventories.commit(inventory);
    }

    return updatedReservation;
  }
}

export default FulfillReservation;
