import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import SaleEntity from 'src/infrastructure/database/entities/sale.entity';
import SaleLineItemEntity from 'src/infrastructure/database/entities/sale-line-item.entity';
import SalePaymentEntity from 'src/infrastructure/database/entities/sale-payment.entity';
import SaleRepository from 'src/infrastructure/database/repositories/sale/sale.repository';
import SaleDBRepository from 'src/infrastructure/database/repositories/sale/sale.db-repository';
import SaleLineItemRepository from 'src/infrastructure/database/repositories/sale/sale-line-item.repository';
import SaleLineItemDBRepository from 'src/infrastructure/database/repositories/sale/sale-line-item.db-repository';
import SalePaymentRepository from 'src/infrastructure/database/repositories/sale/sale-payment.repository';
import SalePaymentDBRepository from 'src/infrastructure/database/repositories/sale/sale-payment.db-repository';
import SaleController from 'src/presentation/http/controllers/sale.controller';
import CreateSaleHandler from 'src/application/sale/commands/create-sale/create-sale';
import RecordSalePaymentHandler from 'src/application/sale/commands/record-payment/record-payment';
import CancelSaleHandler from 'src/application/sale/commands/cancel-sale/cancel-sale';
import UpdateSaleHandler from 'src/application/sale/commands/update-sale/update-sale.handler';
import OnSupplyFulfilledHandler from 'src/application/sale/event-handlers/on-supply-fulfilled.handler';
import SaleQuery from 'src/application/sale/queries/sale.query';
import SaleSerialiser from 'src/presentation/serialisers/sale.serialiser';
import { SaleSeed } from 'src/infrastructure/database/seeds/sale.seed';
import { StaffModule } from '../staff/staff.module';
import { BranchModule } from '../branch/branch.module';
import { CustomerModule } from '../customer/customer.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([SaleEntity, SaleLineItemEntity, SalePaymentEntity]),
    StaffModule,
    BranchModule,
    CustomerModule,
    AuthModule,
  ],
  controllers: [SaleController],
  providers: [
    {
      provide: SaleRepository,
      useClass: SaleDBRepository,
    },
    {
      provide: SaleLineItemRepository,
      useClass: SaleLineItemDBRepository,
    },
    {
      provide: SalePaymentRepository,
      useClass: SalePaymentDBRepository,
    },
    SaleQuery,
    SaleSerialiser,
    SaleSeed,
    CreateSaleHandler,
    RecordSalePaymentHandler,
    CancelSaleHandler,
    UpdateSaleHandler,
    OnSupplyFulfilledHandler,
  ],
  exports: [SaleRepository, SaleSerialiser, SaleSeed],
})
export class SaleModule {}
