import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import UnreserveStockCommand from './unreserve-stock.command';
import StockReservation from 'src/domain/inventory/stock-reservation';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import StockReservationRepository from 'src/infrastructure/database/repositories/inventory/stock-reservation.repository';

@CommandHandler(UnreserveStockCommand)
class UnreserveStock implements ICommandHandler<UnreserveStockCommand> {
  constructor(
    private inventories: InventoryRepository,
    private reservations: StockReservationRepository,
  ) {}

  async execute(command: UnreserveStockCommand): Promise<StockReservation> {
    const reservation = await this.reservations.findById(command.reservationId);

    if (!reservation) {
      throw new Error(`Reservation with id ${command.reservationId} not found`);
    }

    if (!reservation.isActive()) {
      throw new Error(
        `Reservation ${command.reservationId} is not active (status: ${reservation.getStatus()})`,
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

export default UnreserveStock;