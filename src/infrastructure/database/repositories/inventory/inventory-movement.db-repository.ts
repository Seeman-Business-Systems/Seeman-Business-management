import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import InventoryMovement from 'src/domain/inventory/inventory-movement';
import InventoryMovementEntity from '../../entities/inventory-movement.entity';
import InventoryMovementRepository from './inventory-movement.repository';
import InventoryMovementType from 'src/domain/inventory/inventory-movement-type';

@Injectable()
class InventoryMovementDBRepository extends InventoryMovementRepository {
  constructor(
    @InjectRepository(InventoryMovementEntity)
    private readonly repository: Repository<InventoryMovementEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<InventoryMovement | null> {
    const record = await this.repository.findOne({
      where: { id },
      relations: ['inventoryBatch'],
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByBatchId(batchId: number): Promise<InventoryMovement[]> {
    const records = await this.repository.find({
      where: { inventoryBatch: { id: batchId } },
      relations: ['inventoryBatch'],
      order: { createdAt: 'DESC' },
    });

    return records.map((entity: InventoryMovementEntity) =>
      this.toDomain(entity),
    );
  }

  async findByType(type: InventoryMovementType): Promise<InventoryMovement[]> {
    const records = await this.repository.find({
      where: { type },
      relations: ['inventoryBatch'],
      order: { createdAt: 'DESC' },
    });

    return records.map((entity: InventoryMovementEntity) =>
      this.toDomain(entity),
    );
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<InventoryMovement[]> {
    const records = await this.repository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['inventoryBatch'],
      order: { createdAt: 'DESC' },
    });

    return records.map((entity: InventoryMovementEntity) =>
      this.toDomain(entity),
    );
  }

  async findByOrderId(orderId: number): Promise<InventoryMovement[]> {
    const records = await this.repository.find({
      where: { orderId },
      relations: ['inventoryBatch'],
      order: { createdAt: 'DESC' },
    });

    return records.map((entity: InventoryMovementEntity) =>
      this.toDomain(entity),
    );
  }

  async findAll(): Promise<InventoryMovement[]> {
    const records = await this.repository.find({
      relations: ['inventoryBatch'],
      order: { createdAt: 'DESC' },
    });

    return records.map((entity: InventoryMovementEntity) =>
      this.toDomain(entity),
    );
  }

  async commit(movement: InventoryMovement): Promise<InventoryMovement> {
    const entity = new InventoryMovementEntity();
    if (movement.getId()) {
      entity.id = movement.getId()!;
    }
    entity.inventoryBatch = { id: movement.getInventoryBatchId() } as any;
    entity.type = movement.getType();
    entity.quantity = movement.getQuantity();
    entity.orderId = movement.getOrderId();
    entity.transferToWarehouseId = movement.getTransferToWarehouseId();
    entity.notes = movement.getNotes();
    entity.actorId = movement.getActorId();
    entity.createdAt = movement.getCreatedAt();

    const savedEntity = await this.repository.save(entity);
    const fullEntity = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: ['inventoryBatch'],
    });

    if (!fullEntity) {
      throw new Error('Failed to retrieve saved inventory movement');
    }

    return this.toDomain(fullEntity);
  }

  toDomain(entity: InventoryMovementEntity): InventoryMovement {
    return new InventoryMovement(
      entity.id,
      entity.inventoryBatch.id,
      entity.type,
      entity.quantity,
      entity.orderId,
      entity.transferToWarehouseId,
      entity.notes,
      entity.actorId,
      entity.createdAt,
    );
  }
}

export default InventoryMovementDBRepository;
