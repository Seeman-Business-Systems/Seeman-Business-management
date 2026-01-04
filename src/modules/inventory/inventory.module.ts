import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import InventoryEntity from 'src/infrastructure/database/entities/inventory.entity';
import InventoryBatchEntity from 'src/infrastructure/database/entities/inventory-batch.entity';
import InventoryMovementEntity from 'src/infrastructure/database/entities/inventory-movement.entity';
import ProductVariantEntity from 'src/infrastructure/database/entities/product-variant.entity';
import WarehouseEntity from 'src/infrastructure/database/entities/warehouse.entity';
import StaffEntity from 'src/infrastructure/database/entities/staff.entity';
import InventoryController from 'src/presentation/http/controllers/inventory.controller';
import InventoryBatchController from 'src/presentation/http/controllers/inventory-batch.controller';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryDBRepository from 'src/infrastructure/database/repositories/inventory/inventory.db-repository';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';
import InventoryBatchDBRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.db-repository';
import InventoryMovementRepository from 'src/infrastructure/database/repositories/inventory/inventory-movement.repository';
import InventoryMovementDBRepository from 'src/infrastructure/database/repositories/inventory/inventory-movement.db-repository';
import InventoryQuery from 'src/application/inventory/queries/inventory.query';
import InventoryBatchQuery from 'src/application/inventory/queries/inventory-batch.query';
import InventoryMovementQuery from 'src/application/inventory/queries/inventory-movement.query';
import InventorySerialiser from 'src/presentation/serialisers/inventory.serialiser';
import InventoryBatchSerialiser from 'src/presentation/serialisers/inventory-batch.serialiser';
import InventoryMovementSerialiser from 'src/presentation/serialisers/inventory-movement.serialiser';
import CreateInventoryBatch from 'src/application/inventory/commands/inventory-batch/create/create-inventory-batch';
import ReceiveBatch from 'src/application/inventory/commands/inventory-batch/receive/receive-batch';
import UpdateBatchStatus from 'src/application/inventory/commands/inventory-batch/update-status/update-batch-status';
import TransferBatch from 'src/application/inventory/commands/inventory-batch/transfer/transfer-batch';
import AdjustBatch from 'src/application/inventory/commands/inventory-batch/adjust/adjust-batch';
import DeleteBatch from 'src/application/inventory/commands/inventory-batch/delete/delete-batch';
import SetReorderLevels from 'src/application/inventory/commands/inventory/set-reorder-levels/set-reorder-levels';
import ReserveStock from 'src/application/inventory/commands/inventory/reserve-stock/reserve-stock';
import { StaffModule } from '../staff/staff.module';
import { ProductModule } from '../product/product.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { StaffSerialiser } from 'src/presentation/serialisers/staff.serialiser';
import { InventorySeed } from 'src/infrastructure/database/seeds/inventory.seed';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      InventoryEntity,
      InventoryBatchEntity,
      InventoryMovementEntity,
      ProductVariantEntity,
      WarehouseEntity,
      StaffEntity,
    ]),
    StaffModule,
    ProductModule,
    WarehouseModule,
  ],
  controllers: [InventoryController, InventoryBatchController],
  providers: [
    {
      provide: InventoryRepository,
      useClass: InventoryDBRepository,
    },
    {
      provide: InventoryBatchRepository,
      useClass: InventoryBatchDBRepository,
    },
    {
      provide: InventoryMovementRepository,
      useClass: InventoryMovementDBRepository,
    },
    InventoryQuery,
    InventoryBatchQuery,
    InventoryMovementQuery,
    InventorySerialiser,
    InventoryBatchSerialiser,
    InventoryMovementSerialiser,
    StaffSerialiser,
    CreateInventoryBatch,
    ReceiveBatch,
    UpdateBatchStatus,
    TransferBatch,
    AdjustBatch,
    DeleteBatch,
    SetReorderLevels,
    ReserveStock,
    InventorySeed,
  ],
  exports: [
    InventoryRepository,
    InventoryBatchRepository,
    InventoryMovementRepository,
    InventorySeed,
  ],
})
export class InventoryModule {}