import { Injectable } from '@nestjs/common';
import InventoryBatchRepository from '../repositories/inventory/inventory-batch.repository';
import InventoryRepository from '../repositories/inventory/inventory.repository';
import InventoryMovementRepository from '../repositories/inventory/inventory-movement.repository';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import Inventory from 'src/domain/inventory/inventory';
import InventoryMovement from 'src/domain/inventory/inventory-movement';
import InventoryBatchStatus from 'src/domain/inventory/inventory-batch-status';
import InventoryMovementType from 'src/domain/inventory/inventory-movement-type';
import { ActorType } from 'src/domain/common/actor-type';

@Injectable()
export class InventorySeed {
  constructor(
    private readonly inventories: InventoryRepository,
    private readonly inventoryBatches: InventoryBatchRepository,
    private readonly inventoryMovements: InventoryMovementRepository,
  ) {}

  async seed() {
    const existingBatches = await this.inventoryBatches.findAll();

    if (existingBatches.length > 0) {
      console.log('Inventory batches already exist. Skipping seed.');
      return;
    }

    // Warehouse IDs based on seeding order:
    // 1. Onitsha Central Warehouse
    // 2. Onitsha Main Market Plaza
    // 3. Abuja Regional Warehouse
    // 4. Lagos Island Retail Store
    // 5. Lagos Mainland Warehouse

    // Product Variant IDs (first few from seed):
    // 1-3: Bridgestone Turanza T005 (195/65 R15, 205/55 R16, 225/45 R17)
    // 4-6: Presa PS01 (175/70 R13, 185/65 R14, 195/65 R15)
    // 7-8: Maxxis MA-P3 (185/70 R14, 195/60 R15)
    // 9-10: Michelin Primacy 4 (205/55 R16, 225/45 R17)
    // 11-12: Bridgestone Dueler H/T (225/65 R17, 265/65 R17)
    // 13-14: Maxxis AT-771 (265/70 R16, 235/75 R15)
    // 15-16: Austone Tricycle (4.00-8, 4.50-12)
    // 17: Hifly Keke NAPEP (4.00-8)
    // 18-19: Firestone Performer (18.4-30, 11.2-24)
    // 20: Dunlop Farm Pro (16.9-28)
    // 21-22: Bridgestone Duravis (195/70 R15C, 215/75 R16C)
    // 23-25: Seeman Standard Battery (NS40, NS60, N70)
    // 26-27: Varta Blue Dynamic (E11, D59)
    // 28-29: Bosch S4 (005, 007)
    // 30-31: Solite Silver (65D23L, 75D23L)

    const inventoryData: Array<{
      variantId: number;
      warehouseId: number;
      batches: Array<{
        batchNumber: string;
        quantityReceived: number;
        costPricePerUnit: number;
        status: InventoryBatchStatus;
        receivedDate: Date | null;
        expiryDate: Date | null;
      }>;
      minimumQuantity: number;
      maximumQuantity: number;
    }> = [
      // Popular car tyres in multiple warehouses
      {
        variantId: 1, // Bridgestone Turanza 195/65 R15
        warehouseId: 1, // Onitsha Central
        minimumQuantity: 20,
        maximumQuantity: 100,
        batches: [
          {
            batchNumber: 'BRI-T005-195-2024-001',
            quantityReceived: 50,
            costPricePerUnit: 38000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-11-15'),
            expiryDate: null,
          },
          {
            batchNumber: 'BRI-T005-195-2024-002',
            quantityReceived: 30,
            costPricePerUnit: 39500,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-12-20'),
            expiryDate: null,
          },
        ],
      },
      {
        variantId: 1, // Bridgestone Turanza 195/65 R15
        warehouseId: 5, // Lagos Mainland
        minimumQuantity: 15,
        maximumQuantity: 60,
        batches: [
          {
            batchNumber: 'BRI-T005-195-2024-003',
            quantityReceived: 40,
            costPricePerUnit: 40000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-12-10'),
            expiryDate: null,
          },
        ],
      },
      {
        variantId: 4, // Presa PS01 175/70 R13
        warehouseId: 1, // Onitsha Central
        minimumQuantity: 30,
        maximumQuantity: 150,
        batches: [
          {
            batchNumber: 'PRE-PS01-175-2024-001',
            quantityReceived: 100,
            costPricePerUnit: 15000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-11-01'),
            expiryDate: null,
          },
          {
            batchNumber: 'PRE-PS01-175-2025-001',
            quantityReceived: 80,
            costPricePerUnit: 15500,
            status: InventoryBatchStatus.ON_THE_WAY,
            receivedDate: null,
            expiryDate: null,
          },
        ],
      },
      {
        variantId: 5, // Presa PS01 185/65 R14
        warehouseId: 2, // Onitsha Main Market Plaza
        minimumQuantity: 25,
        maximumQuantity: 120,
        batches: [
          {
            batchNumber: 'PRE-PS01-185-2024-001',
            quantityReceived: 75,
            costPricePerUnit: 18500,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-12-05'),
            expiryDate: null,
          },
        ],
      },
      {
        variantId: 9, // Michelin Primacy 4 205/55 R16
        warehouseId: 3, // Abuja Regional
        minimumQuantity: 10,
        maximumQuantity: 50,
        batches: [
          {
            batchNumber: 'MIC-PRI4-205-2024-001',
            quantityReceived: 25,
            costPricePerUnit: 55000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-12-01'),
            expiryDate: null,
          },
        ],
      },
      {
        variantId: 11, // Bridgestone Dueler 225/65 R17
        warehouseId: 1, // Onitsha Central
        minimumQuantity: 15,
        maximumQuantity: 80,
        batches: [
          {
            batchNumber: 'BRI-DHT-225-2024-001',
            quantityReceived: 40,
            costPricePerUnit: 58000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-11-20'),
            expiryDate: null,
          },
        ],
      },
      {
        variantId: 15, // Austone Tricycle 4.00-8
        warehouseId: 1, // Onitsha Central
        minimumQuantity: 50,
        maximumQuantity: 200,
        batches: [
          {
            batchNumber: 'AUS-TRI-400-2024-001',
            quantityReceived: 150,
            costPricePerUnit: 10000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-11-10'),
            expiryDate: null,
          },
          {
            batchNumber: 'AUS-TRI-400-2024-002',
            quantityReceived: 100,
            costPricePerUnit: 10200,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-12-18'),
            expiryDate: null,
          },
        ],
      },
      {
        variantId: 15, // Austone Tricycle 4.00-8
        warehouseId: 2, // Onitsha Main Market Plaza
        minimumQuantity: 40,
        maximumQuantity: 150,
        batches: [
          {
            batchNumber: 'AUS-TRI-400-2024-003',
            quantityReceived: 120,
            costPricePerUnit: 10100,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-12-01'),
            expiryDate: null,
          },
        ],
      },
      {
        variantId: 17, // Hifly Keke NAPEP 4.00-8
        warehouseId: 2, // Onitsha Main Market Plaza
        minimumQuantity: 60,
        maximumQuantity: 250,
        batches: [
          {
            batchNumber: 'HIF-KEKE-400-2024-001',
            quantityReceived: 200,
            costPricePerUnit: 9500,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-11-25'),
            expiryDate: null,
          },
        ],
      },
      // Batteries with expiry dates
      {
        variantId: 23, // Seeman Standard NS40
        warehouseId: 1, // Onitsha Central
        minimumQuantity: 20,
        maximumQuantity: 100,
        batches: [
          {
            batchNumber: 'SEE-STD-NS40-2024-001',
            quantityReceived: 50,
            costPricePerUnit: 28000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-10-01'),
            expiryDate: new Date('2026-10-01'), // 2 year shelf life
          },
          {
            batchNumber: 'SEE-STD-NS40-2024-002',
            quantityReceived: 40,
            costPricePerUnit: 29000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-12-15'),
            expiryDate: new Date('2026-12-15'),
          },
        ],
      },
      {
        variantId: 24, // Seeman Standard NS60
        warehouseId: 1, // Onitsha Central
        minimumQuantity: 15,
        maximumQuantity: 80,
        batches: [
          {
            batchNumber: 'SEE-STD-NS60-2024-001',
            quantityReceived: 45,
            costPricePerUnit: 35000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-11-01'),
            expiryDate: new Date('2026-11-01'),
          },
        ],
      },
      {
        variantId: 25, // Seeman Standard N70
        warehouseId: 1, // Onitsha Central
        minimumQuantity: 10,
        maximumQuantity: 60,
        batches: [
          {
            batchNumber: 'SEE-STD-N70-2024-001',
            quantityReceived: 30,
            costPricePerUnit: 46000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-11-15'),
            expiryDate: new Date('2026-11-15'),
          },
        ],
      },
      {
        variantId: 26, // Varta Blue Dynamic E11
        warehouseId: 3, // Abuja Regional
        minimumQuantity: 8,
        maximumQuantity: 40,
        batches: [
          {
            batchNumber: 'VAR-BD-E11-2024-001',
            quantityReceived: 20,
            costPricePerUnit: 58000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-12-01'),
            expiryDate: new Date('2027-12-01'), // Premium battery, 3 year shelf life
          },
        ],
      },
      {
        variantId: 28, // Bosch S4 005
        warehouseId: 5, // Lagos Mainland
        minimumQuantity: 10,
        maximumQuantity: 50,
        batches: [
          {
            batchNumber: 'BOS-S4-005-2024-001',
            quantityReceived: 25,
            costPricePerUnit: 52000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-11-20'),
            expiryDate: new Date('2027-11-20'),
          },
        ],
      },
      // Agricultural tyres - lower volume, higher value
      {
        variantId: 18, // Firestone Performer 18.4-30
        warehouseId: 1, // Onitsha Central
        minimumQuantity: 5,
        maximumQuantity: 25,
        batches: [
          {
            batchNumber: 'FIR-PERF-184-2024-001',
            quantityReceived: 10,
            costPricePerUnit: 150000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-10-15'),
            expiryDate: null,
          },
        ],
      },
      {
        variantId: 20, // Dunlop Farm Pro 16.9-28
        warehouseId: 1, // Onitsha Central
        minimumQuantity: 3,
        maximumQuantity: 20,
        batches: [
          {
            batchNumber: 'DUN-FARM-169-2024-001',
            quantityReceived: 8,
            costPricePerUnit: 130000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-11-01'),
            expiryDate: null,
          },
          {
            batchNumber: 'DUN-FARM-169-2025-001',
            quantityReceived: 12,
            costPricePerUnit: 135000,
            status: InventoryBatchStatus.ORDERED,
            receivedDate: null,
            expiryDate: null,
          },
        ],
      },
      // Light truck tyres
      {
        variantId: 21, // Bridgestone Duravis 195/70 R15C
        warehouseId: 5, // Lagos Mainland
        minimumQuantity: 12,
        maximumQuantity: 60,
        batches: [
          {
            batchNumber: 'BRI-DUR-195-2024-001',
            quantityReceived: 35,
            costPricePerUnit: 35000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-12-10'),
            expiryDate: null,
          },
        ],
      },
      // Low stock scenario for testing alerts
      {
        variantId: 10, // Michelin Primacy 4 225/45 R17
        warehouseId: 4, // Lagos Island Retail Store
        minimumQuantity: 15,
        maximumQuantity: 50,
        batches: [
          {
            batchNumber: 'MIC-PRI4-225-2024-001',
            quantityReceived: 10, // Below minimum
            costPricePerUnit: 63000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-12-01'),
            expiryDate: null,
          },
        ],
      },
      // Motorcycle battery
      {
        variantId: 39, // Solite Bike YTX7A-BS (if exists)
        warehouseId: 2, // Onitsha Main Market Plaza
        minimumQuantity: 20,
        maximumQuantity: 100,
        batches: [
          {
            batchNumber: 'SOL-BIKE-YTX7A-2024-001',
            quantityReceived: 60,
            costPricePerUnit: 10000,
            status: InventoryBatchStatus.ARRIVED,
            receivedDate: new Date('2024-11-10'),
            expiryDate: new Date('2026-11-10'),
          },
        ],
      },
    ];

    let createdBatches = 0;
    let createdInventories = 0;
    let createdMovements = 0;

    for (const invData of inventoryData) {
      // Create or find inventory record
      let inventory = await this.inventories.findByVariantAndWarehouse(
        invData.variantId,
        invData.warehouseId,
      );

      if (!inventory) {
        inventory = new Inventory(
          undefined,
          invData.variantId,
          invData.warehouseId,
          0, // Will be updated as batches are added
          invData.minimumQuantity,
          invData.maximumQuantity,
          0, // No reserved stock initially
          new Date(),
          new Date(),
        );
        inventory = await this.inventories.commit(inventory);
        createdInventories++;
      }

      // Create inventory batches
      for (const batchData of invData.batches) {
        const batch = new InventoryBatch(
          undefined,
          inventory.getId()!,
          invData.warehouseId,
          batchData.batchNumber,
          1, // Default supplier ID (will be replaced when Supplier module exists)
          batchData.quantityReceived,
          batchData.quantityReceived, // Current quantity = received quantity initially
          batchData.costPricePerUnit,
          batchData.status,
          batchData.receivedDate,
          batchData.expiryDate,
          ActorType.SYSTEM_ACTOR,
          new Date(),
          new Date(),
          null,
        );

        const savedBatch = await this.inventoryBatches.commit(batch);
        createdBatches++;

        // Create inventory movement for ARRIVED batches
        if (batchData.status === InventoryBatchStatus.ARRIVED) {
          const movement = new InventoryMovement(
            undefined,
            savedBatch.getId()!,
            InventoryMovementType.IN,
            batchData.quantityReceived,
            null, // No order ID
            null, // No transfer warehouse
            `Initial stock received - Batch ${batchData.batchNumber}`,
            ActorType.SYSTEM_ACTOR,
            batchData.receivedDate!,
          );

          await this.inventoryMovements.commit(movement);
          createdMovements++;

          // Update inventory total
          inventory.setTotalQuantity(
            inventory.getTotalQuantity() + batchData.quantityReceived,
          );
          inventory.setUpdatedAt(new Date());
          await this.inventories.commit(inventory);
        }
      }
    }

    console.log(`✅ Inventory seeding completed:`);
    console.log(
      `   - Total stock value: ₦${this.calculateTotalValue(inventoryData)}`,
    );
  }

  private calculateTotalValue(
    inventoryData: Array<{
      batches: Array<{
        quantityReceived: number;
        costPricePerUnit: number;
        status: InventoryBatchStatus;
      }>;
    }>,
  ): string {
    let totalValue = 0;
    for (const invData of inventoryData) {
      for (const batch of invData.batches) {
        if (batch.status === InventoryBatchStatus.ARRIVED) {
          totalValue += batch.quantityReceived * batch.costPricePerUnit;
        }
      }
    }
    return totalValue.toLocaleString();
  }
}