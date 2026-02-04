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
import { StaffModule } from '../staff/staff.module';
import { RoleModule } from '../role/role.module';
import { ProductModule } from '../product/product.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { InventorySeed } from 'src/infrastructure/database/seeds/inventory.seed';
import InventoryReservationEntity from 'src/infrastructure/database/entities/inventory-reservation.entity';
import InventoryReservationController from 'src/presentation/http/controllers/inventory-reservation.controller';
import InventoryReservationRepository from 'src/infrastructure/database/repositories/inventory/inventory-reservation.repository';
import InventoryReservationDBRepository from 'src/infrastructure/database/repositories/inventory/inventory-reservation.db-repository';
import InventoryReservationQuery from 'src/application/inventory/queries/inventory-reservation.query';
import InventoryReservationSerialiser from 'src/presentation/serialisers/inventory-reservation.serialiser';
import ReserveInventory from 'src/application/inventory/commands/inventory/reserve-inventory/reserve-inventory';
import CancelReservation from 'src/application/inventory/commands/inventory-reservation/cancel-reservation/cancel-reservation';
import FulfillReservation from 'src/application/inventory/commands/inventory-reservation/fulfill-reservation/fulfill-reservation';
import UpdateReservation from 'src/application/inventory/commands/inventory-reservation/update-reservation/update-reservation';
import { InventoryReservationSeed } from 'src/infrastructure/database/seeds/inventory-reservation.seed';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      InventoryEntity,
      InventoryBatchEntity,
      InventoryMovementEntity,
      InventoryReservationEntity,
      ProductVariantEntity,
      WarehouseEntity,
      StaffEntity,
    ]),
    StaffModule,
    RoleModule,
    ProductModule,
    WarehouseModule,
  ],
  controllers: [
    InventoryController,
    InventoryBatchController,
    InventoryReservationController,
  ],
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
    {
      provide: InventoryReservationRepository,
      useClass: InventoryReservationDBRepository,
    },
    InventoryQuery,
    InventoryBatchQuery,
    InventoryMovementQuery,
    InventoryReservationQuery,
    InventorySerialiser,
    InventoryBatchSerialiser,
    InventoryMovementSerialiser,
    InventoryReservationSerialiser,
    CreateInventoryBatch,
    ReceiveBatch,
    UpdateBatchStatus,
    TransferBatch,
    AdjustBatch,
    DeleteBatch,
    SetReorderLevels,
    ReserveInventory,
    CancelReservation,
    FulfillReservation,
    UpdateReservation,
    InventorySeed,
    InventoryReservationSeed,
  ],
  exports: [
    InventoryRepository,
    InventoryBatchRepository,
    InventoryMovementRepository,
    InventoryReservationRepository,
    InventorySeed,
    InventoryReservationSeed,
  ],
})
export class InventoryModule {}
