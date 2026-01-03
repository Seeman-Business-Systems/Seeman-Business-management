import { Injectable } from '@nestjs/common';
import InventoryMovement from 'src/domain/inventory/inventory-movement';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import { StaffSerialiser } from './staff.serialiser';

@Injectable()
class InventoryMovementSerialiser {
  constructor(
    private readonly staff: StaffRepository,
    private readonly staffSerialiser: StaffSerialiser,
  ) {}

  async serialise(movement: InventoryMovement) {
    const actor = await this.staff.findById(movement.getActorId());

    return {
      id: movement.getId(),
      inventoryBatchId: movement.getInventoryBatchId(),
      type: movement.getType(),
      quantity: movement.getQuantity(),
      orderId: movement.getOrderId(),
      transferToWarehouseId: movement.getTransferToWarehouseId(),
      notes: movement.getNotes(),
      isInbound: movement.isInbound(),
      isOutbound: movement.isOutbound(),
      isAdjustment: movement.isAdjustment(),
      isTransfer: movement.isTransfer(),
      actor: actor ? this.staffSerialiser.serialise(actor) : null,
      createdAt: movement.getCreatedAt(),
    };
  }

  async serialiseMany(movements: InventoryMovement[]) {
    return Promise.all(movements.map((movement) => this.serialise(movement)));
  }
}

export default InventoryMovementSerialiser;