import { Injectable } from '@nestjs/common';
import Warehouse from 'src/domain/warehouse/warehouse';
import WarehouseEntity from '../../entities/warehouse.entity';
import WarehouseStatus from 'src/domain/warehouse/warehouse-status';

@Injectable()
abstract class WarehouseRepository {
  abstract findById(id: number): Promise<Warehouse | null>;
  abstract findByBranch(branchId: number): Promise<Warehouse[]>;
  abstract findByStatus(status: WarehouseStatus): Promise<Warehouse[]>;
  abstract findAll(): Promise<Warehouse[]>;
  abstract delete(id: number): Promise<void>;
  abstract restore(id: number): Promise<Warehouse>;
  abstract commit(warehouse: Warehouse): Promise<Warehouse>;
  abstract toDomain(entity: WarehouseEntity): Warehouse;
}

export default WarehouseRepository;
