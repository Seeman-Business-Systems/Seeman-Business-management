import { Command } from '@nestjs/cqrs';
import InventoryReservation from 'src/domain/inventory/inventory-reservation';


class ReserveInventoryCommand extends Command<InventoryReservation> {
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

export default ReserveInventoryCommand;
