import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import ReserveStockCommand from './reserve-stock.command';
import StockReservation from 'src/domain/inventory/stock-reservation';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import StockReservationRepository from 'src/infrastructure/database/repositories/inventory/stock-reservation.repository';
import ReservationStatus from 'src/domain/inventory/reservation-status';

@CommandHandler(ReserveStockCommand)
class ReserveStock implements ICommandHandler<ReserveStockCommand> {
  constructor(
    private inventories: InventoryRepository,
    private reservations: StockReservationRepository,
  ) {}

  async execute(command: ReserveStockCommand): Promise<StockReservation> {
    const inventory = await this.inventories.findByVariantAndWarehouse(
      command.variantId,
      command.warehouseId,
    );

    if (!inventory) {
      throw new Error(
        `No inventory found for variant ${command.variantId} in warehouse ${command.warehouseId}`,
      );
    }

    const availableQuantity = inventory.getAvailableQuantity();

    if (availableQuantity < command.quantity) {
      throw new Error(
        `Insufficient available stock. Available: ${availableQuantity}, Requested: ${command.quantity}`,
      );
    }

    // Create the stock reservation
    const reservation = new StockReservation(
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

export default ReserveStock;