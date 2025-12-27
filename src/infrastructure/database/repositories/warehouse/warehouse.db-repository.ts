import Warehouse from 'src/domain/warehouse/warehouse';
import WarehouseRepository from './warehouse.repository';
import WarehouseEntity from 'src/infrastructure/database/entities/warehouse.entity';
import WarehouseStatus from 'src/domain/warehouse/warehouse-status';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
class WarehouseDBRepository extends WarehouseRepository {
  constructor(
    @InjectRepository(WarehouseEntity)
    private readonly repository: Repository<WarehouseEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<Warehouse | null> {
    const record = await this.repository.findOne({
      where: { id },
      relations: ['branch', 'manager']
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findByBranch(branchId: number): Promise<Warehouse[]> {
    const records = await this.repository.find({
      where: { branch: { id: branchId } },
      relations: ['branch', 'manager']
    });

    return records.map((entity: WarehouseEntity) => this.toDomain(entity));
  }

  async findByStatus(status: WarehouseStatus): Promise<Warehouse[]> {
    const records = await this.repository.find({
      where: { status },
      relations: ['branch', 'manager']
    });

    return records.map((entity: WarehouseEntity) => this.toDomain(entity));
  }

  async findAll(): Promise<Warehouse[]> {
    const records = await this.repository.find({
      relations: ['branch', 'manager']
    });

    return records.map((entity: WarehouseEntity) => this.toDomain(entity));
  }

  async delete(id: number): Promise<void> {
    this.repository.softDelete(id);
  }

  async restore(id: number): Promise<Warehouse> {
    await this.repository.restore(id);
    const restoredRecord = await this.repository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['branch', 'manager']
    });

    if (!restoredRecord) {
      throw new Error(`Warehouse with id ${id} not found`);
    }

    return this.toDomain(restoredRecord);
  }

  async commit(warehouse: Warehouse): Promise<Warehouse> {
    const entity = Object.assign(new WarehouseEntity(), warehouse);
    const savedEntity = await this.repository.save(entity);

    return this.toDomain(savedEntity);
  }

  toDomain(entity: WarehouseEntity): Warehouse {
    return new Warehouse(
      entity.id,
      entity.name,
      entity.address,
      entity.city,
      entity.state,
      entity.status,
      entity.phoneNumber,
      entity.branch?.id ?? null,
      entity.manager?.id ?? null,
      entity.warehouseType,
      entity.capacity,
      entity.createdBy,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  }
}

export default WarehouseDBRepository;
