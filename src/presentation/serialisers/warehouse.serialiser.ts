import { Injectable } from '@nestjs/common';
import Warehouse from 'src/domain/warehouse/warehouse';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';
import { StaffSerialiser } from './staff.serialiser';
import BranchSerialiser from './branch.serialiser';

@Injectable()
class WarehouseSerialiser {
  constructor(
    private readonly staff: StaffRepository,
    private readonly branches: BranchRepository,
    private readonly staffSerialiser: StaffSerialiser,
    private readonly branchSerialiser: BranchSerialiser,
  ) {}

  async serialise(warehouse: Warehouse, includeRelations: boolean = false) {
    const creator = await this.staff.findById(warehouse.getCreatedBy());

    const result: any = {
      id: warehouse.getId(),
      name: warehouse.getName(),
      address: warehouse.getAddress(),
      city: warehouse.getCity(),
      state: warehouse.getState(),
      status: warehouse.getStatus(),
      phoneNumber: warehouse.getPhoneNumber(),
      warehouseType: warehouse.getWarehouseType(),
      capacity: warehouse.getCapacity(),
      branchId: warehouse.getBranchId(),
      managerId: warehouse.getManagerId(),
      createdBy: creator ? this.staffSerialiser.serialise(creator) : null,
      createdAt: warehouse.getCreatedAt(),
      updatedAt: warehouse.getUpdatedAt(),
      deletedAt: warehouse.getDeletedAt(),
    };

    if (includeRelations) {
      if (warehouse.getBranchId()) {
        const branch = await this.branches.findById(warehouse.getBranchId()!);
        result.branch = branch
          ? await this.branchSerialiser.serialise(branch)
          : null;
      }

      if (warehouse.getManagerId()) {
        const manager = await this.staff.findById(warehouse.getManagerId()!);
        result.manager = manager
          ? this.staffSerialiser.serialise(manager)
          : null;
      }
    }

    return result;
  }

  async serialiseMany(
    warehouses: Warehouse[],
    includeRelations: boolean = false,
  ) {
    return Promise.all(
      warehouses.map((warehouse) =>
        this.serialise(warehouse, includeRelations),
      ),
    );
  }
}

export default WarehouseSerialiser;
