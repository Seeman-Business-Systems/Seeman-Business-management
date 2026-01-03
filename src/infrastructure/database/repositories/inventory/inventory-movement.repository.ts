import { Injectable } from '@nestjs/common';
import InventoryMovement from 'src/domain/inventory/inventory-movement';
import InventoryMovementEntity from '../../entities/inventory-movement.entity';
import InventoryMovementType from 'src/domain/inventory/inventory-movement-type';

@Injectable()
abstract class InventoryMovementRepository {
  abstract findById(id: number): Promise<InventoryMovement | null>;
  abstract findByBatchId(batchId: number): Promise<InventoryMovement[]>;
  abstract findByType(type: InventoryMovementType): Promise<InventoryMovement[]>;
  abstract findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<InventoryMovement[]>;
  abstract findByOrderId(orderId: number): Promise<InventoryMovement[]>;
  abstract findAll(): Promise<InventoryMovement[]>;
  abstract commit(movement: InventoryMovement): Promise<InventoryMovement>;
  abstract toDomain(entity: InventoryMovementEntity): InventoryMovement;
}

export default InventoryMovementRepository;