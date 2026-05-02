import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import InventoryBatchRepository from './inventory-batch.repository';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchItem from 'src/domain/inventory/inventory-batch-item';
import InventoryBatchEntity from '../../entities/inventory-batch.entity';
import InventoryBatchItemEntity from '../../entities/inventory-batch-item.entity';

@Injectable()
class InventoryBatchDBRepository extends InventoryBatchRepository {
  constructor(
    @InjectRepository(InventoryBatchEntity)
    private readonly batches: Repository<InventoryBatchEntity>,
    @InjectRepository(InventoryBatchItemEntity)
    private readonly items: Repository<InventoryBatchItemEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<InventoryBatch | null> {
    const entity = await this.batches.findOne({
      where: { id },
      relations: ['creator', 'items', 'items.variant', 'items.warehouse'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(offloaded?: boolean): Promise<InventoryBatch[]> {
    const qb = this.batches.createQueryBuilder('b')
      .leftJoinAndSelect('b.creator', 'creator')
      .leftJoinAndSelect('b.items', 'items')
      .leftJoinAndSelect('items.warehouse', 'warehouse')
      .orderBy('b.createdAt', 'DESC');

    if (offloaded === true) {
      qb.andWhere('b.offloadedAt IS NOT NULL');
    } else if (offloaded === false) {
      qb.andWhere('b.offloadedAt IS NULL');
    }

    const records = await qb.getMany();
    return records.map((e) => this.toDomain(e));
  }

  async commit(batch: InventoryBatch): Promise<InventoryBatch> {
    const entity = new InventoryBatchEntity();
    if (batch.getId()) entity.id = batch.getId()!;
    entity.batchNumber = batch.getBatchNumber();
    entity.arrivedAt = batch.getArrivedAt();
    entity.notes = batch.getNotes();
    entity.offloadedAt = batch.getOffloadedAt();
    entity.createdBy = batch.getCreatedBy();

    const saved = await this.batches.save(entity);
    return this.toDomain(saved);
  }

  async addItem(item: InventoryBatchItem): Promise<InventoryBatchItem> {
    const entity = new InventoryBatchItemEntity();
    entity.batchId = item.getBatchId();
    entity.variantId = item.getVariantId();
    entity.warehouseId = item.getWarehouseId();
    entity.quantity = item.getQuantity();

    const saved = await this.items.save(entity);
    return this.itemToDomain(saved);
  }

  async removeItem(itemId: number): Promise<void> {
    await this.items.delete(itemId);
  }

  async findItems(batchId: number): Promise<InventoryBatchItem[]> {
    const records = await this.items.find({ where: { batchId }, relations: ['variant', 'warehouse'] });
    return records.map((e) => this.itemToDomain(e));
  }

  async findItem(itemId: number): Promise<InventoryBatchItem | null> {
    const entity = await this.items.findOne({ where: { id: itemId } });
    return entity ? this.itemToDomain(entity) : null;
  }

  private toDomain(entity: InventoryBatchEntity): InventoryBatch {
    return new InventoryBatch(
      entity.id,
      entity.batchNumber,
      entity.arrivedAt,
      entity.notes,
      entity.offloadedAt,
      entity.createdBy,
      entity.createdAt,
    );
  }

  private itemToDomain(entity: InventoryBatchItemEntity): InventoryBatchItem {
    return new InventoryBatchItem(entity.id, entity.batchId, entity.variantId, entity.warehouseId, entity.quantity);
  }
}

export default InventoryBatchDBRepository;
