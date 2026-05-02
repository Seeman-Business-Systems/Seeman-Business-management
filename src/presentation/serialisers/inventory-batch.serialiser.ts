import { Injectable } from '@nestjs/common';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchItem from 'src/domain/inventory/inventory-batch-item';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';
import ProductSerialiser from './product.serialiser';
import WarehouseRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.repository';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';

@Injectable()
class InventoryBatchSerialiser {
  constructor(
    private readonly batchRepo: InventoryBatchRepository,
    private readonly warehouseRepo: WarehouseRepository,
    private readonly variantRepo: ProductVariantRepository,
    private readonly productSerialiser: ProductSerialiser,
  ) {}

  async serialise(batch: InventoryBatch, includeItems = false) {
    const items = includeItems ? await this.serialiseItems(batch.getId()!) : undefined;

    return {
      id: batch.getId(),
      batchNumber: batch.getBatchNumber(),
      arrivedAt: batch.getArrivedAt(),
      notes: batch.getNotes(),
      isOffloaded: batch.isOffloaded(),
      offloadedAt: batch.getOffloadedAt(),
      createdBy: batch.getCreatedBy(),
      createdAt: batch.getCreatedAt(),
      ...(includeItems ? { items } : {}),
    };
  }

  async serialiseMany(batches: InventoryBatch[]) {
    return Promise.all(batches.map((b) => this.serialise(b, true)));
  }

  private async serialiseItems(batchId: number) {
    const items = await this.batchRepo.findItems(batchId);
    return Promise.all(items.map((item) => this.serialiseItem(item)));
  }

  async serialiseItem(item: InventoryBatchItem) {
    const [variant, warehouse] = await Promise.all([
      this.variantRepo.findById(item.getVariantId()),
      this.warehouseRepo.findById(item.getWarehouseId()),
    ]);
    return {
      id: item.getId(),
      batchId: item.getBatchId(),
      variantId: item.getVariantId(),
      variant: variant ? await this.productSerialiser.serialiseVariant(variant) : null,
      warehouseId: item.getWarehouseId(),
      warehouse: warehouse
        ? { id: warehouse.getId(), name: warehouse.getName(), city: warehouse.getCity(), state: warehouse.getState() }
        : null,
      quantity: item.getQuantity(),
    };
  }
}

export default InventoryBatchSerialiser;
