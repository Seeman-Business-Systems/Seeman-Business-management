import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchEntity from '../../entities/inventory-batch.entity';
import InventoryBatchRepository from './inventory-batch.repository';
import InventoryBatchStatus from 'src/domain/inventory/inventory-batch-status';

@Injectable()
class InventoryBatchDBRepository extends InventoryBatchRepository {
  constructor(
    @InjectRepository(InventoryBatchEntity)
    private readonly repository: Repository<InventoryBatchEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<InventoryBatch | null> {
    const record = await this.repository.findOne({
      where: { id },
      relations: ['inventory', 'warehouse'],
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByInventoryId(inventoryId: number): Promise<InventoryBatch[]> {
    const records = await this.repository.find({
      where: { inventory: { id: inventoryId } },
      relations: ['inventory', 'warehouse'],
    });

    return records.map((entity: InventoryBatchEntity) => this.toDomain(entity));
  }

  async findByBatchNumber(batchNumber: string): Promise<InventoryBatch | null> {
    const record = await this.repository.findOne({
      where: { batchNumber },
      relations: ['inventory', 'warehouse'],
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByStatus(status: InventoryBatchStatus): Promise<InventoryBatch[]> {
    const records = await this.repository.find({
      where: { status },
      relations: ['inventory', 'warehouse'],
    });

    return records.map((entity: InventoryBatchEntity) => this.toDomain(entity));
  }

  async findByWarehouse(warehouseId: number): Promise<InventoryBatch[]> {
    const records = await this.repository.find({
      where: { warehouse: { id: warehouseId } },
      relations: ['inventory', 'warehouse'],
    });

    return records.map((entity: InventoryBatchEntity) => this.toDomain(entity));
  }

  async findExpiringBatches(days: number): Promise<InventoryBatch[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const records = await this.repository.find({
      where: {
        expiryDate: LessThan(futureDate),
        status: InventoryBatchStatus.ARRIVED,
      },
      relations: ['inventory', 'warehouse'],
    });

    return records.map((entity: InventoryBatchEntity) => this.toDomain(entity));
  }

  async findOldestBatches(
    variantId: number,
    warehouseId: number,
  ): Promise<InventoryBatch[]> {
    const records = await this.repository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.inventory', 'inventory')
      .leftJoinAndSelect('batch.warehouse', 'warehouse')
      .leftJoinAndSelect('inventory.variant', 'variant')
      .where('variant.id = :variantId', { variantId })
      .andWhere('warehouse.id = :warehouseId', { warehouseId })
      .andWhere('batch.status = :status', {
        status: InventoryBatchStatus.ARRIVED,
      })
      .andWhere('batch.currentQuantity > 0')
      .orderBy('batch.receivedDate', 'ASC')
      .getMany();

    return records.map((entity: InventoryBatchEntity) => this.toDomain(entity));
  }

  async findAll(): Promise<InventoryBatch[]> {
    const records = await this.repository.find({
      relations: ['inventory', 'warehouse'],
    });

    return records.map((entity: InventoryBatchEntity) => this.toDomain(entity));
  }

  async commit(batch: InventoryBatch): Promise<InventoryBatch> {
    const entity = new InventoryBatchEntity();
    if (batch.getId()) {
      entity.id = batch.getId()!;
    }
    entity.inventory = { id: batch.getInventoryId() } as any;
    entity.warehouse = { id: batch.getWarehouseId() } as any;
    entity.batchNumber = batch.getBatchNumber();
    entity.supplierId = batch.getSupplierId();
    entity.quantityReceived = batch.getQuantityReceived();
    entity.currentQuantity = batch.getCurrentQuantity();
    entity.costPricePerUnit = batch.getCostPricePerUnit();
    entity.status = batch.getStatus();
    entity.receivedDate = batch.getReceivedDate();
    entity.expiryDate = batch.getExpiryDate();
    entity.createdBy = batch.getCreatedBy();
    entity.createdAt = batch.getCreatedAt();
    entity.updatedAt = batch.getUpdatedAt();
    if (batch.getDeletedAt()) {
      entity.deletedAt = batch.getDeletedAt()!;
    }

    const savedEntity = await this.repository.save(entity);
    const fullEntity = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: ['inventory', 'warehouse'],
    });

    if (!fullEntity) {
      throw new Error('Failed to retrieve saved inventory batch');
    }

    return this.toDomain(fullEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async restore(id: number): Promise<InventoryBatch> {
    await this.repository.restore(id);
    const restoredRecord = await this.repository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['inventory', 'warehouse'],
    });

    if (!restoredRecord) {
      throw new Error(`Inventory batch with id ${id} not found`);
    }

    return this.toDomain(restoredRecord);
  }

  toDomain(entity: InventoryBatchEntity): InventoryBatch {
    return new InventoryBatch(
      entity.id,
      entity.inventory.id,
      entity.warehouse.id,
      entity.batchNumber,
      entity.supplierId,
      entity.quantityReceived,
      entity.currentQuantity,
      Number(entity.costPricePerUnit),
      entity.status,
      entity.receivedDate,
      entity.expiryDate,
      entity.createdBy,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt ?? null,
    );
  }
}

export default InventoryBatchDBRepository;