import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Inventory from 'src/domain/inventory/inventory';
import TransactionContext from 'src/application/shared/transactions/transaction-context';
import TypeOrmTransactionContext from '../../transactions/typeorm-transaction-context';
import InventoryEntity from '../../entities/inventory.entity';
import SupplyItemEntity from '../../entities/supply-item.entity';
import SupplyStatus from 'src/domain/supply/supply-status';
import InventoryRepository from './inventory.repository';

@Injectable()
class InventoryDBRepository extends InventoryRepository {
  constructor(
    @InjectRepository(InventoryEntity)
    private readonly repository: Repository<InventoryEntity>,
    @InjectRepository(SupplyItemEntity)
    private readonly supplyItems: Repository<SupplyItemEntity>,
  ) {
    super();
  }

  private repoFor(tx?: TransactionContext): Repository<InventoryEntity> {
    const manager = TypeOrmTransactionContext.unwrap(tx);
    return manager ? manager.getRepository(InventoryEntity) : this.repository;
  }

  private async attachPendingQuantities(inventories: Inventory[]): Promise<void> {
    if (inventories.length === 0) return;

    const variantIds = Array.from(new Set(inventories.map((i) => i.getVariantId())));
    const warehouseIds = Array.from(new Set(inventories.map((i) => i.getWarehouseId())));

    const rows = await this.supplyItems
      .createQueryBuilder('item')
      .innerJoin('item.supply', 'supply')
      .select('item.variant_id', 'variantId')
      .addSelect('item.warehouse_id', 'warehouseId')
      .addSelect('SUM(item.quantity)', 'pending')
      .where('supply.status = :status', { status: SupplyStatus.DRAFT })
      .andWhere('item.variant_id IN (:...variantIds)', { variantIds })
      .andWhere('item.warehouse_id IN (:...warehouseIds)', { warehouseIds })
      .groupBy('item.variant_id')
      .addGroupBy('item.warehouse_id')
      .getRawMany<{ variantId: number; warehouseId: number; pending: string }>();

    const pendingMap = new Map<string, number>();
    for (const row of rows) {
      pendingMap.set(`${row.variantId}:${row.warehouseId}`, Number(row.pending));
    }

    for (const inv of inventories) {
      const key = `${inv.getVariantId()}:${inv.getWarehouseId()}`;
      inv.setPendingQuantity(pendingMap.get(key) ?? 0);
    }
  }

  async findById(id: number): Promise<Inventory | null> {
    const record = await this.repository.findOne({
      where: { id },
      relations: ['variant', 'warehouse'],
    });

    if (!record) {
      return null;
    }

    const inventory = this.toDomain(record);
    await this.attachPendingQuantities([inventory]);
    return inventory;
  }

  async findByVariantAndWarehouse(
    variantId: number,
    warehouseId: number,
    tx?: TransactionContext,
  ): Promise<Inventory | null> {
    const record = await this.repoFor(tx).findOne({
      where: {
        variant: { id: variantId },
        warehouse: { id: warehouseId },
      },
      relations: ['variant', 'warehouse'],
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByVariantAndWarehouseForUpdate(
    variantId: number,
    warehouseId: number,
    tx: TransactionContext,
  ): Promise<Inventory | null> {
    const record = await this.repoFor(tx).findOne({
      where: {
        variant: { id: variantId },
        warehouse: { id: warehouseId },
      },
      relations: ['variant', 'warehouse'],
      lock: { mode: 'pessimistic_write' },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByWarehouse(warehouseId: number): Promise<Inventory[]> {
    const records = await this.repository.find({
      where: { warehouse: { id: warehouseId } },
      relations: ['variant', 'warehouse'],
    });

    const inventories = records.map((entity: InventoryEntity) => this.toDomain(entity));
    await this.attachPendingQuantities(inventories);
    return inventories;
  }

  async findByVariant(variantId: number): Promise<Inventory[]> {
    const records = await this.repository.find({
      where: { variant: { id: variantId } },
      relations: ['variant', 'warehouse'],
    });

    const inventories = records.map((entity: InventoryEntity) => this.toDomain(entity));
    await this.attachPendingQuantities(inventories);
    return inventories;
  }

  async findLowInventory(warehouseId?: number): Promise<Inventory[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.variant', 'variant')
      .leftJoinAndSelect('inventory.warehouse', 'warehouse')
      .where('inventory.totalQuantity < inventory.minimumQuantity');

    if (warehouseId) {
      queryBuilder.andWhere('warehouse.id = :warehouseId', { warehouseId });
    }

    const records = await queryBuilder.getMany();
    const inventories = records.map((entity: InventoryEntity) => this.toDomain(entity));
    await this.attachPendingQuantities(inventories);
    return inventories;
  }

  async findAll(): Promise<Inventory[]> {
    const records = await this.repository.find({
      relations: ['variant', 'warehouse'],
    });

    const inventories = records.map((entity: InventoryEntity) => this.toDomain(entity));
    await this.attachPendingQuantities(inventories);
    return inventories;
  }

  async commit(inventory: Inventory, tx?: TransactionContext): Promise<Inventory> {
    const repo = this.repoFor(tx);
    const entity = new InventoryEntity();
    if (inventory.getId()) {
      entity.id = inventory.getId()!;
    }
    entity.variant = { id: inventory.getVariantId() } as any;
    entity.warehouse = { id: inventory.getWarehouseId() } as any;
    entity.totalQuantity = inventory.getTotalQuantity();
    entity.minimumQuantity = inventory.getMinimumQuantity();
    entity.maximumQuantity = inventory.getMaximumQuantity();
    entity.createdAt = inventory.getCreatedAt();
    entity.updatedAt = inventory.getUpdatedAt();

    const savedEntity = await repo.save(entity);
    const fullEntity = await repo.findOne({
      where: { id: savedEntity.id },
      relations: ['variant', 'warehouse'],
    });

    if (!fullEntity) {
      throw new Error('Failed to retrieve saved inventory');
    }

    return this.toDomain(fullEntity);
  }

  toDomain(entity: InventoryEntity): Inventory {
    return new Inventory(
      entity.id,
      entity.variantId,
      entity.warehouseId,
      entity.totalQuantity,
      entity.minimumQuantity,
      entity.maximumQuantity,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}

export default InventoryDBRepository;
