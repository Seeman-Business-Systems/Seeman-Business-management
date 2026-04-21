import { Injectable } from '@nestjs/common';
import Warehouse from 'src/domain/warehouse/warehouse';

@Injectable()
class WarehouseSerialiser {
  async serialise(warehouse: Warehouse) {
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
      createdAt: warehouse.getCreatedAt(),
      updatedAt: warehouse.getUpdatedAt(),
    };

    return result;
  }

  async serialiseMany(warehouses: Warehouse[]) {
    return Promise.all(warehouses.map((warehouse) => this.serialise(warehouse)));
  }
}

export default WarehouseSerialiser;
