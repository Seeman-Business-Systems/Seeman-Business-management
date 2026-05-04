import { Injectable } from '@nestjs/common';
import WarehouseRepository from '../repositories/warehouse/warehouse.repository';
import Warehouse from 'src/domain/warehouse/warehouse';
import WarehouseStatus from 'src/domain/warehouse/warehouse-status';
import WarehouseType from 'src/domain/warehouse/warehouse-type';
import { ActorType } from 'src/domain/common/actor-type';

// Branch IDs (set by branch seed):
//   1 = Head Office (Onitsha) — main branch
//   2 = Lagos Branch 1
//   3 = Abuja Central
//   4 = Lagos Branch 2
//
// Warehouse layout (resulting IDs):
//   B1: 1 main, 2-3 regional, 4-8 retail (×5), 9 garage  → 9 warehouses
//   B2: 10 plaza, 11-12 retail (×2)                      → 3 warehouses
//   B3: 13-14 regional (×2)                              → 2 warehouses
//   B4: 15 regional warehouse, 16 retail                 → 2 warehouses

@Injectable()
export class WarehouseSeed {
  constructor(private readonly warehouses: WarehouseRepository) {}

  async seed() {
    const existing: Warehouse[] = await this.warehouses.findAll();

    if (existing.length > 0) {
      console.log('Warehouses already exist. Skipping seed.');
      return;
    }

    const onitshaAddress = 'F11/15 New Tyre Rd';
    const onitshaCity = 'Onitsha';
    const onitshaState = 'Anambra';
    const onitshaPhone = '+2348031957100';

    const lagos1Address = '11B Ebute Metta';
    const lagos1City = 'Lagos';
    const lagos1State = 'Lagos';
    const lagos1Phone = '+2348029200666';

    const abujaAddress = '78 Central Business District';
    const abujaCity = 'Abuja';
    const abujaState = 'FCT';
    const abujaPhone = '+2348093456789';

    const lagos2Address = '46 Enuowa Street';
    const lagos2City = 'Ikeja';
    const lagos2State = 'Lagos';
    const lagos2Phone = '+2348074567890';

    const defaults = [
      // --- Branch 1: Head Office (Onitsha) ---
      {
        name: 'Onitsha Main Warehouse',
        address: onitshaAddress,
        city: onitshaCity,
        state: onitshaState,
        phoneNumber: onitshaPhone,
        branchId: 1,
        warehouseType: WarehouseType.MAIN_WAREHOUSE,
        capacity: 12000,
      },
      {
        name: 'Onitsha Regional Warehouse 1',
        address: onitshaAddress,
        city: onitshaCity,
        state: onitshaState,
        phoneNumber: onitshaPhone,
        branchId: 1,
        warehouseType: WarehouseType.REGIONAL_WAREHOUSE,
        capacity: 8000,
      },
      {
        name: 'Onitsha Regional Warehouse 2',
        address: onitshaAddress,
        city: onitshaCity,
        state: onitshaState,
        phoneNumber: onitshaPhone,
        branchId: 1,
        warehouseType: WarehouseType.REGIONAL_WAREHOUSE,
        capacity: 8000,
      },
      {
        name: 'Onitsha Retail Store 1',
        address: onitshaAddress,
        city: onitshaCity,
        state: onitshaState,
        phoneNumber: onitshaPhone,
        branchId: 1,
        warehouseType: WarehouseType.RETAIL_STORE,
        capacity: 1500,
      },
      {
        name: 'Onitsha Retail Store 2',
        address: onitshaAddress,
        city: onitshaCity,
        state: onitshaState,
        phoneNumber: onitshaPhone,
        branchId: 1,
        warehouseType: WarehouseType.RETAIL_STORE,
        capacity: 1500,
      },
      {
        name: 'Onitsha Retail Store 3',
        address: onitshaAddress,
        city: onitshaCity,
        state: onitshaState,
        phoneNumber: onitshaPhone,
        branchId: 1,
        warehouseType: WarehouseType.RETAIL_STORE,
        capacity: 1500,
      },
      {
        name: 'Onitsha Retail Store 4',
        address: onitshaAddress,
        city: onitshaCity,
        state: onitshaState,
        phoneNumber: onitshaPhone,
        branchId: 1,
        warehouseType: WarehouseType.RETAIL_STORE,
        capacity: 1500,
      },
      {
        name: 'Onitsha Retail Store 5',
        address: onitshaAddress,
        city: onitshaCity,
        state: onitshaState,
        phoneNumber: onitshaPhone,
        branchId: 1,
        warehouseType: WarehouseType.RETAIL_STORE,
        capacity: 1500,
      },
      {
        name: 'Onitsha Garage',
        address: onitshaAddress,
        city: onitshaCity,
        state: onitshaState,
        phoneNumber: onitshaPhone,
        branchId: 1,
        warehouseType: WarehouseType.GARAGE,
        capacity: 500,
      },

      // --- Branch 2: Lagos Branch 1 ---
      {
        name: 'Lagos Branch 1 Plaza',
        address: lagos1Address,
        city: lagos1City,
        state: lagos1State,
        phoneNumber: lagos1Phone,
        branchId: 2,
        warehouseType: WarehouseType.PLAZA,
        capacity: 5000,
      },
      {
        name: 'Lagos Branch 1 Retail Store 1',
        address: lagos1Address,
        city: lagos1City,
        state: lagos1State,
        phoneNumber: lagos1Phone,
        branchId: 2,
        warehouseType: WarehouseType.RETAIL_STORE,
        capacity: 2000,
      },
      {
        name: 'Lagos Branch 1 Retail Store 2',
        address: lagos1Address,
        city: lagos1City,
        state: lagos1State,
        phoneNumber: lagos1Phone,
        branchId: 2,
        warehouseType: WarehouseType.RETAIL_STORE,
        capacity: 2000,
      },

      // --- Branch 3: Abuja Central ---
      {
        name: 'Abuja Regional Warehouse 1',
        address: abujaAddress,
        city: abujaCity,
        state: abujaState,
        phoneNumber: abujaPhone,
        branchId: 3,
        warehouseType: WarehouseType.REGIONAL_WAREHOUSE,
        capacity: 8000,
      },
      {
        name: 'Abuja Regional Warehouse 2',
        address: abujaAddress,
        city: abujaCity,
        state: abujaState,
        phoneNumber: abujaPhone,
        branchId: 3,
        warehouseType: WarehouseType.REGIONAL_WAREHOUSE,
        capacity: 8000,
      },

      // --- Branch 4: Lagos Branch 2 ---
      {
        name: 'Lagos Branch 2 Warehouse',
        address: lagos2Address,
        city: lagos2City,
        state: lagos2State,
        phoneNumber: lagos2Phone,
        branchId: 4,
        warehouseType: WarehouseType.REGIONAL_WAREHOUSE,
        capacity: 6000,
      },
      {
        name: 'Lagos Branch 2 Retail Store',
        address: lagos2Address,
        city: lagos2City,
        state: lagos2State,
        phoneNumber: lagos2Phone,
        branchId: 4,
        warehouseType: WarehouseType.RETAIL_STORE,
        capacity: 2000,
      },
    ];

    for (const data of defaults) {
      const warehouse = new Warehouse(
        undefined,
        data.name,
        data.address,
        data.city,
        data.state,
        WarehouseStatus.ACTIVE,
        data.phoneNumber,
        data.branchId,
        null,
        data.warehouseType,
        data.capacity,
        ActorType.SYSTEM_ACTOR,
        new Date(),
        new Date(),
      );
      await this.warehouses.commit(warehouse);
    }

    console.log(`✅ ${defaults.length} warehouses seeded successfully`);
  }
}
