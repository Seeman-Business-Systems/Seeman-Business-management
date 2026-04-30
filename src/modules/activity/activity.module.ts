import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import ActivityEntity from 'src/infrastructure/database/entities/activity.entity';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';
import ActivityDBRepository from 'src/infrastructure/database/repositories/activity/activity.db-repository';
import ActivityQuery from 'src/application/activity/queries/activity.query';
import ActivitySerialiser from 'src/presentation/serialisers/activity.serialiser';
import ActivityController from 'src/presentation/http/controllers/activity.controller';
import OnSaleCreatedActivityHandler from 'src/application/activity/event-handlers/on-sale-created.handler';
import OnSaleCancelledActivityHandler from 'src/application/activity/event-handlers/on-sale-cancelled.handler';
import OnPaymentRecordedActivityHandler from 'src/application/activity/event-handlers/on-payment-recorded.handler';
import OnInventoryAdjustedActivityHandler from 'src/application/activity/event-handlers/on-inventory-adjusted.handler';
import OnStockAddedActivityHandler from 'src/application/activity/event-handlers/on-stock-added.handler';
import OnProductCreatedActivityHandler from 'src/application/activity/event-handlers/on-product-created.handler';
import OnBranchCreatedActivityHandler from 'src/application/activity/event-handlers/on-branch-created.handler';
import OnWarehouseCreatedActivityHandler from 'src/application/activity/event-handlers/on-warehouse-created.handler';
import OnCustomerCreatedActivityHandler from 'src/application/activity/event-handlers/on-customer-created.handler';
import OnSupplyCreatedActivityHandler from 'src/application/activity/event-handlers/on-supply-created.handler';
import OnSupplyFulfilledActivityHandler from 'src/application/activity/event-handlers/on-supply-fulfilled.handler';
import OnStaffTransferredActivityHandler from 'src/application/activity/event-handlers/on-staff-transferred.handler';
import OnExpenseCreatedActivityHandler from 'src/application/activity/event-handlers/on-expense-created.handler';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ActivityEntity]),
  ],
  controllers: [ActivityController],
  providers: [
    { provide: ActivityRepository, useClass: ActivityDBRepository },
    ActivityDBRepository,
    ActivityQuery,
    ActivitySerialiser,
    OnSaleCreatedActivityHandler,
    OnSaleCancelledActivityHandler,
    OnPaymentRecordedActivityHandler,
    OnInventoryAdjustedActivityHandler,
    OnStockAddedActivityHandler,
    OnProductCreatedActivityHandler,
    OnBranchCreatedActivityHandler,
    OnWarehouseCreatedActivityHandler,
    OnCustomerCreatedActivityHandler,
    OnSupplyCreatedActivityHandler,
    OnSupplyFulfilledActivityHandler,
    OnStaffTransferredActivityHandler,
    OnExpenseCreatedActivityHandler,
  ],
  exports: [ActivitySerialiser],
})
export class ActivityModule {}
