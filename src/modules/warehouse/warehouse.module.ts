import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import WarehouseEntity from 'src/infrastructure/database/entities/warehouse.entity';
import WarehouseDBRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.db-repository';
import WarehouseController from 'src/presentation/http/controllers/warehouse.controller';
import CreateWarehouseHandler from 'src/application/warehouse/commands/create/create-warehouse';
import UpdateWarehouseHandler from 'src/application/warehouse/commands/update/update-warehouse';
import DeleteWarehouseHandler from 'src/application/warehouse/commands/delete/delete-warehouse';
import AssignWarehouseToStaffHandler from 'src/application/warehouse/commands/assign/assign-warehouse-to-staff';
import WarehouseRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.repository';
import WarehouseQuery from 'src/application/warehouse/queries/warehouse.query';
import WarehouseSerialiser from 'src/presentation/serialisers/warehouse.serialiser';
import { StaffModule } from '../staff/staff.module';
import { BranchModule } from '../branch/branch.module';
import { StaffSerialiser } from 'src/presentation/serialisers/staff.serialiser';
import BranchSerialiser from 'src/presentation/serialisers/branch.serialiser';
import StaffEntity from 'src/infrastructure/database/entities/staff.entity';
import BranchEntity from 'src/infrastructure/database/entities/branch.entity';
import { WarehouseSeed } from 'src/infrastructure/database/seeds/warehouse.seed';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([WarehouseEntity, StaffEntity, BranchEntity]),
    StaffModule,
    BranchModule,
  ],
  controllers: [WarehouseController],
  providers: [
    {
      provide: WarehouseRepository,
      useClass: WarehouseDBRepository,
    },
    WarehouseQuery,
    WarehouseSerialiser,
    StaffSerialiser,
    BranchSerialiser,
    CreateWarehouseHandler,
    UpdateWarehouseHandler,
    DeleteWarehouseHandler,
    AssignWarehouseToStaffHandler,
    WarehouseSeed,
  ],
  exports: [WarehouseRepository, WarehouseSeed],
})
export class WarehouseModule {}
