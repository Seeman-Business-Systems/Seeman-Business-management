import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import BranchEntity from 'src/infrastructure/database/entities/branch.entity';
import StaffEntity from 'src/infrastructure/database/entities/staff.entity';
import RoleEntity from 'src/infrastructure/database/entities/role.entity';
import BranchDBRepository from 'src/infrastructure/database/repositories/branch/branch.db-repository';
import BranchController from 'src/presentation/http/controllers/branch.controller';
import CreateBranchHandler from 'src/application/branch/commands/create/create-branch';
import UpdateBranchHandler from 'src/application/branch/commands/update/update-branch';
import DeleteBranchHandler from 'src/application/branch/commands/delete/delete-branch';
import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import StaffDBRepository from 'src/infrastructure/database/repositories/staff/staff.db-repository';
import RoleRepository from 'src/infrastructure/database/repositories/role/role.repository';
import RoleDBRepository from 'src/infrastructure/database/repositories/role/role.db-repository';
import { BranchSeed } from 'src/infrastructure/database/seeds/branch.seed';
import BranchQuery from 'src/application/branch/queries/branch.query';
import BranchSerialiser from 'src/presentation/serialisers/branch.serialiser';
import { StaffSerialiser } from 'src/presentation/serialisers/staff.serialiser';
import { RoleSerialiser } from 'src/presentation/serialisers/role.serialiser';
import { BaseStaffSerialiser } from 'src/presentation/serialisers/base-staff.serialiser';
import { BaseBranchSerialiser } from 'src/presentation/serialisers/base-branch.serialiser';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([BranchEntity, StaffEntity, RoleEntity]),
  ],
  controllers: [BranchController],
  providers: [
    {
      provide: BranchRepository,
      useClass: BranchDBRepository,
    },
    {
      provide: StaffRepository,
      useClass: StaffDBRepository,
    },
    {
      provide: RoleRepository,
      useClass: RoleDBRepository,
    },
    BranchQuery,
    BranchSerialiser,
    StaffSerialiser,
    RoleSerialiser,
    BaseStaffSerialiser,
    BaseBranchSerialiser,
    BranchSeed,
    CreateBranchHandler,
    UpdateBranchHandler,
    DeleteBranchHandler,
  ],
  exports: [BranchRepository, BranchSeed, BranchSerialiser, BaseBranchSerialiser],
})
export class BranchModule {}
