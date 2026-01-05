import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Inventory from 'src/domain/inventory/inventory';
import InventoryEntity from '../../entities/inventory.entity';
import InventoryRepository from './inventory.repository';

@Injectable()
class InventoryDBRepository extends InventoryRepository {
  constructor(
    @InjectRepository(InventoryEntity)
    private readonly repository: Repository<InventoryEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<Inventory | null> {
    const record = await this.repository.findOne({
      where: { id },
      relations: ['variant', 'warehouse'],
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByVariantAndWarehouse(
    variantId: number,
    warehouseId: number,
  ): Promise<Inventory | null> {
    const record = await this.repository.findOne({
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

  async findByWarehouse(warehouseId: number): Promise<Inventory[]> {
    const records = await this.repository.find({
      where: { warehouse: { id: warehouseId } },
      relations: ['variant', 'warehouse'],
    });

    return records.map((entity: InventoryEntity) => this.toDomain(entity));
  }

  async findByVariant(variantId: number): Promise<Inventory[]> {
    const records = await this.repository.find({
      where: { variant: { id: variantId } },
      relations: ['variant', 'warehouse'],
    });

    return records.map((entity: InventoryEntity) => this.toDomain(entity));
  }

  async findLowStock(warehouseId?: number): Promise<Inventory[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.variant', 'variant')
      .leftJoinAndSelect('inventory.warehouse', 'warehouse')
      .where('inventory.totalQuantity < inventory.minimumQuantity');

    if (warehouseId) {
      queryBuilder.andWhere('warehouse.id = :warehouseId', { warehouseId });
    }

    const records = await queryBuilder.getMany();
    return records.map((entity: InventoryEntity) => this.toDomain(entity));
  }

  async findAll(): Promise<Inventory[]> {
    const records = await this.repository.find({
      relations: ['variant', 'warehouse'],
    });

    return records.map((entity: InventoryEntity) => this.toDomain(entity));
  }

  async commit(inventory: Inventory): Promise<Inventory> {
    const entity = new InventoryEntity();
    if (inventory.getId()) {
      entity.id = inventory.getId()!;
    }
    entity.variant = { id: inventory.getVariantId() } as any;
    entity.warehouse = { id: inventory.getWarehouseId() } as any;
    entity.totalQuantity = inventory.getTotalQuantity();
    entity.minimumQuantity = inventory.getMinimumQuantity();
    entity.maximumQuantity = inventory.getMaximumQuantity();
    entity.reservedQuantity = inventory.getReservedQuantity();
    entity.createdAt = inventory.getCreatedAt();
    entity.updatedAt = inventory.getUpdatedAt();

    const savedEntity = await this.repository.save(entity);
    const fullEntity = await this.repository.findOne({
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
      entity.reservedQuantity,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}

export default InventoryDBRepository;