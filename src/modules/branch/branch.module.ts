import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import BranchEntity from 'src/infrastructure/database/entities/branch.entity';
import BranchDBRepository from 'src/infrastructure/database/repositories/branch/branch.db-repository';
import BranchController from 'src/presentation/http/controllers/branch.controller';
import CreateBranchHandler from 'src/application/branch/commands/create/create-branch';
import UpdateBranchHandler from 'src/application/branch/commands/update/update-branch';
import DeleteBranchHandler from 'src/application/branch/commands/delete/delete-branch';
import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';
import { BranchSeed } from 'src/infrastructure/database/seeds/branch.seed';
import BranchQuery from 'src/application/branch/queries/branch.query';
import BranchSerialiser from 'src/presentation/serialisers/branch.serialiser';
import { StaffModule } from '../staff/staff.module';
import { StaffSerialiser } from 'src/presentation/serialisers/staff.serialiser';
import StaffEntity from 'src/infrastructure/database/entities/staff.entity';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([BranchEntity, StaffEntity]),
    StaffModule,
  ],
  controllers: [BranchController],
  providers: [
    {
      provide: BranchRepository,
      useClass: BranchDBRepository,
    },
    BranchQuery,
    BranchSerialiser,
    StaffSerialiser,
    BranchSeed,
    CreateBranchHandler,
    UpdateBranchHandler,
    DeleteBranchHandler,
  ],
  exports: [BranchRepository, BranchSeed],
})
export class BranchModule {}
