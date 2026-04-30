import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryModule } from '../inventory/inventory.module';
import SupplyEntity from 'src/infrastructure/database/entities/supply.entity';
import SupplyItemEntity from 'src/infrastructure/database/entities/supply-item.entity';
import SupplyRepository from 'src/infrastructure/database/repositories/supply/supply.repository';
import SupplyDBRepository from 'src/infrastructure/database/repositories/supply/supply.db-repository';
import SupplyItemRepository from 'src/infrastructure/database/repositories/supply/supply-item.repository';
import SupplyItemDBRepository from 'src/infrastructure/database/repositories/supply/supply-item.db-repository';
import SupplyQuery from 'src/application/supply/queries/supply.query';
import SupplySerialiser from 'src/presentation/serialisers/supply.serialiser';
import SupplyController from 'src/presentation/http/controllers/supply.controller';
import OnSaleCreatedSupplyHandler from 'src/application/supply/event-handlers/on-sale-created.handler';
import FulfilSupplyHandler from 'src/application/supply/commands/fulfil-supply/fulfil-supply.handler';
import CancelSupplyHandler from 'src/application/supply/commands/cancel-supply/cancel-supply.handler';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([SupplyEntity, SupplyItemEntity]),
    InventoryModule,
  ],
  controllers: [SupplyController],
  providers: [
    { provide: SupplyRepository, useClass: SupplyDBRepository },
    { provide: SupplyItemRepository, useClass: SupplyItemDBRepository },
    SupplyDBRepository,
    SupplyItemDBRepository,
    SupplyQuery,
    SupplySerialiser,
    OnSaleCreatedSupplyHandler,
    FulfilSupplyHandler,
    CancelSupplyHandler,
  ],
  exports: [SupplyRepository, SupplySerialiser],
})
export class SupplyModule {}
