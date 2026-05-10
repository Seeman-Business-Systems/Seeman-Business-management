import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import InventoryEntity from 'src/infrastructure/database/entities/inventory.entity';
import InventoryBatchEntity from 'src/infrastructure/database/entities/inventory-batch.entity';
import InventoryBatchItemEntity from 'src/infrastructure/database/entities/inventory-batch-item.entity';
import ProductVariantEntity from 'src/infrastructure/database/entities/product-variant.entity';
import WarehouseEntity from 'src/infrastructure/database/entities/warehouse.entity';
import StaffEntity from 'src/infrastructure/database/entities/staff.entity';
import SupplyItemEntity from 'src/infrastructure/database/entities/supply-item.entity';

// Controllers
import InventoryController from 'src/presentation/http/controllers/inventory.controller';
import InventoryBatchController from 'src/presentation/http/controllers/inventory-batch.controller';

// Repositories
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryDBRepository from 'src/infrastructure/database/repositories/inventory/inventory.db-repository';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';
import InventoryBatchDBRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.db-repository';

// Queries & Serialisers
import InventoryQuery from 'src/application/inventory/queries/inventory.query';
import InventorySerialiser from 'src/presentation/serialisers/inventory.serialiser';
import InventoryBatchSerialiser from 'src/presentation/serialisers/inventory-batch.serialiser';

// Inventory Command Handlers
import SetReorderLevels from 'src/application/inventory/commands/inventory/set-reorder-levels/set-reorder-levels';
import AddStockHandler from 'src/application/inventory/commands/inventory/add-stock/add-stock.handler';
import AdjustInventoryHandler from 'src/application/inventory/commands/inventory/adjust-inventory/adjust-inventory.handler';

// Batch Command Handlers
import CreateBatchHandler from 'src/application/inventory/commands/batch/create-batch.handler';
import AddBatchItemHandler from 'src/application/inventory/commands/batch/add-batch-item.handler';
import RemoveBatchItemHandler from 'src/application/inventory/commands/batch/remove-batch-item.handler';
import OffloadBatchHandler from 'src/application/inventory/commands/batch/offload-batch.handler';

import { InventorySeed } from 'src/infrastructure/database/seeds/inventory.seed';
import { StaffModule } from '../staff/staff.module';
import { RoleModule } from '../role/role.module';
import { ProductModule } from '../product/product.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      InventoryEntity,
      InventoryBatchEntity,
      InventoryBatchItemEntity,
      ProductVariantEntity,
      WarehouseEntity,
      StaffEntity,
      SupplyItemEntity,
    ]),
    StaffModule,
    RoleModule,
    forwardRef(() => ProductModule),
    WarehouseModule,
    AuthModule,
  ],
  controllers: [InventoryController, InventoryBatchController],
  providers: [
    { provide: InventoryRepository, useClass: InventoryDBRepository },
    { provide: InventoryBatchRepository, useClass: InventoryBatchDBRepository },
    InventoryQuery,
    InventorySerialiser,
    InventoryBatchSerialiser,
    SetReorderLevels,
    AddStockHandler,
    AdjustInventoryHandler,
    CreateBatchHandler,
    AddBatchItemHandler,
    RemoveBatchItemHandler,
    OffloadBatchHandler,
    InventorySeed,
  ],
  exports: [InventoryRepository, InventoryQuery, InventorySeed],
})
export class InventoryModule {}
