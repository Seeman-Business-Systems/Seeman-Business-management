import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import UpdateStaffHandler from "src/application/staff/commands/update/update-staff";
import StaffEntity from "src/infrastructure/database/entities/staff.entity";
import StaffDBRepository from "src/infrastructure/database/repositories/staff/staff.db-repository";
import StaffRepository from "src/infrastructure/database/repositories/staff/staff.repository";
import { StaffSeed } from "src/infrastructure/database/seeds/staff.seed";
import StaffController from "src/presentation/http/controllers/staff.controller";

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([StaffEntity])],
  controllers: [StaffController],
  providers: [
    {
      provide: StaffRepository,
      useClass: StaffDBRepository,
    },
    StaffSeed,
    UpdateStaffHandler,
  ],
  exports: [StaffRepository, StaffSeed],
})
  
export class StaffModule {}
