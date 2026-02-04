import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import UpdateStaffHandler from "src/application/staff/commands/update/update-staff";
import DeleteStaffHandler from "src/application/staff/commands/delete/delete-staff";
import StaffQuery from "src/application/staff/queries/staff.query";
import StaffEntity from "src/infrastructure/database/entities/staff.entity";
import BranchEntity from "src/infrastructure/database/entities/branch.entity";
import RoleEntity from "src/infrastructure/database/entities/role.entity";
import StaffDBRepository from "src/infrastructure/database/repositories/staff/staff.db-repository";
import StaffRepository from "src/infrastructure/database/repositories/staff/staff.repository";
import BranchRepository from "src/infrastructure/database/repositories/branch/branch.repository";
import BranchDBRepository from "src/infrastructure/database/repositories/branch/branch.db-repository";
import RoleRepository from "src/infrastructure/database/repositories/role/role.repository";
import RoleDBRepository from "src/infrastructure/database/repositories/role/role.db-repository";
import { StaffSeed } from "src/infrastructure/database/seeds/staff.seed";
import StaffController from "src/presentation/http/controllers/staff.controller";
import { StaffSerialiser } from "src/presentation/serialisers/staff.serialiser";
import { BaseStaffSerialiser } from "src/presentation/serialisers/base-staff.serialiser";
import { RoleSerialiser } from "src/presentation/serialisers/role.serialiser";

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([StaffEntity, BranchEntity, RoleEntity]),
  ],
  controllers: [StaffController],
  providers: [
    {
      provide: StaffRepository,
      useClass: StaffDBRepository,
    },
    {
      provide: BranchRepository,
      useClass: BranchDBRepository,
    },
    {
      provide: RoleRepository,
      useClass: RoleDBRepository,
    },
    StaffSeed,
    UpdateStaffHandler,
    DeleteStaffHandler,
    StaffQuery,
    StaffSerialiser,
    BaseStaffSerialiser,
    RoleSerialiser,
  ],
  exports: [StaffRepository, StaffSeed, StaffSerialiser, BaseStaffSerialiser],
})

export class StaffModule {}
