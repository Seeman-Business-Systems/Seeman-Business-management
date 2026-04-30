import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import InventoryEntity from 'src/infrastructure/database/entities/inventory.entity';
import ProductVariantEntity from 'src/infrastructure/database/entities/product-variant.entity';
import WarehouseEntity from 'src/infrastructure/database/entities/warehouse.entity';
import StaffEntity from 'src/infrastructure/database/entities/staff.entity';
import InventoryController from 'src/presentation/http/controllers/inventory.controller';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryDBRepository from 'src/infrastructure/database/repositories/inventory/inventory.db-repository';
import InventoryQuery from 'src/application/inventory/queries/inventory.query';
import InventorySerialiser from 'src/presentation/serialisers/inventory.serialiser';
import SetReorderLevels from 'src/application/inventory/commands/inventory/set-reorder-levels/set-reorder-levels';
import AddStockHandler from 'src/application/inventory/commands/inventory/add-stock/add-stock.handler';
import AdjustInventoryHandler from 'src/application/inventory/commands/inventory/adjust-inventory/adjust-inventory.handler';
import { InventorySeed } from 'src/infrastructure/database/seeds/inventory.seed';
import { StaffModule } from '../staff/staff.module';
import { RoleModule } from '../role/role.module';
import { ProductModule } from '../product/product.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      InventoryEntity,
      ProductVariantEntity,
      WarehouseEntity,
      StaffEntity,
    ]),
    StaffModule,
    RoleModule,
    ProductModule,
    WarehouseModule,
  ],
  controllers: [InventoryController],
  providers: [
    { provide: InventoryRepository, useClass: InventoryDBRepository },
    InventoryQuery,
    InventorySerialiser,
    SetReorderLevels,
    AddStockHandler,
    AdjustInventoryHandler,
    InventorySeed,
  ],
  exports: [InventoryRepository, InventoryQuery, InventorySeed],
})
export class InventoryModule {}
