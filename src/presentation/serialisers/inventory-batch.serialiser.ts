import { Injectable } from '@nestjs/common';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import { StaffSerialiser } from './staff.serialiser';

@Injectable()
class InventoryBatchSerialiser {
  constructor(
    private readonly staff: StaffRepository,
    private readonly staffSerialiser: StaffSerialiser,
  ) {}

  async serialise(batch: InventoryBatch) {
    const creator = await this.staff.findById(batch.getCreatedBy());

    return {
      id: batch.getId(),
      inventoryId: batch.getInventoryId(),
      warehouseId: batch.getWarehouseId(),
      batchNumber: batch.getBatchNumber(),
      supplierId: batch.getSupplierId(),
      quantityReceived: batch.getQuantityReceived(),
      currentQuantity: batch.getCurrentQuantity(),
      costPricePerUnit: batch.getCostPricePerUnit(),
      status: batch.getStatus(),
      receivedDate: batch.getReceivedDate(),
      expiryDate: batch.getExpiryDate(),
      isArrived: batch.isArrived(),
      isExpired: batch.isExpired(),
      canTransfer: batch.canTransfer(),
      createdBy: creator ? this.staffSerialiser.serialise(creator) : null,
      createdAt: batch.getCreatedAt(),
      updatedAt: batch.getUpdatedAt(),
      deletedAt: batch.getDeletedAt(),
    };
  }

  async serialiseMany(batches: InventoryBatch[]) {
    return Promise.all(batches.map((batch) => this.serialise(batch)));
  }
}

export default InventoryBatchSerialiser;