import { Injectable } from '@nestjs/common';
import WarehouseRepository from '../repositories/warehouse/warehouse.repository';
import Warehouse from 'src/domain/warehouse/warehouse';
import WarehouseStatus from 'src/domain/warehouse/warehouse-status';
import WarehouseType from 'src/domain/warehouse/warehouse-type';
import { ActorType } from 'src/domain/common/actor-type';

@Injectable()
export class WarehouseSeed {
  constructor(
    private readonly warehouses: WarehouseRepository,
  ) {}

  async seed() {
    const existingWarehouses: Warehouse[] = await this.warehouses.findAll();

    if (existingWarehouses.length > 0) {
      console.log('Warehouses already exist. Skipping seed.');
      return;
    }

    // Branch seeding order:
    // 1. Head Office (Onitsha, Anambra) - ID will be 1
    // 2. Lagos Island Branch - ID will be 2
    // 3. Abuja Central Branch - ID will be 3
    // 4. Onitsha Main Market Branch - ID will be 4

    const defaultWarehouses = [
      {
        id: undefined,
        name: 'Onitsha Central Warehouse',
        address: '123 Main Street',
        city: 'Onitsha',
        state: 'Anambra',
        status: WarehouseStatus.ACTIVE,
        phoneNumber: '+234-803-111-2222',
        branchId: 1, // Head Office (Onitsha)
        managerId: null,
        warehouseType: WarehouseType.MAIN_WAREHOUSE,
        capacity: 10000,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Onitsha Main Market Plaza',
        address: '45 Upper Iweka Road',
        city: 'Onitsha',
        state: 'Anambra',
        status: WarehouseStatus.ACTIVE,
        phoneNumber: '+234-805-222-3333',
        branchId: 4, // Onitsha Main Market Branch
        managerId: null,
        warehouseType: WarehouseType.PLAZA,
        capacity: 5000,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Abuja Regional Warehouse',
        address: '78 Central Business District',
        city: 'Abuja',
        state: 'FCT',
        status: WarehouseStatus.ACTIVE,
        phoneNumber: '+234-809-333-4444',
        branchId: 3, // Abuja Central Branch
        managerId: null,
        warehouseType: WarehouseType.REGIONAL_WAREHOUSE,
        capacity: 8000,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Lagos Island Retail Store',
        address: '45 Marina Road',
        city: 'Lagos',
        state: 'Lagos',
        status: WarehouseStatus.ACTIVE,
        phoneNumber: '+234-802-444-5555',
        branchId: 2, // Lagos Island Branch
        managerId: null,
        warehouseType: WarehouseType.RETAIL_STORE,
        capacity: 2000,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Lagos Mainland Warehouse',
        address: '12 Oshodi-Apapa Expressway',
        city: 'Lagos',
        state: 'Lagos',
        status: WarehouseStatus.ACTIVE,
        phoneNumber: '+234-802-555-6666',
        branchId: 2, // Lagos Island Branch
        managerId: null,
        warehouseType: WarehouseType.REGIONAL_WAREHOUSE,
        capacity: 7000,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const warehouseData of defaultWarehouses) {
      const warehouse = new Warehouse(
        warehouseData.id,
        warehouseData.name,
        warehouseData.address,
        warehouseData.city,
        warehouseData.state,
        warehouseData.status,
        warehouseData.phoneNumber,
        warehouseData.branchId,
        warehouseData.managerId,
        warehouseData.warehouseType,
        warehouseData.capacity,
        warehouseData.createdBy,
        warehouseData.createdAt,
        warehouseData.updatedAt,
      );
      await this.warehouses.commit(warehouse);
    }

    console.log('✅ Default warehouses seeded successfully');
  }
}
