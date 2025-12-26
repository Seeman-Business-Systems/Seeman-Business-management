import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import StaffEntity from "src/infrastructure/database/entities/staff.entity";
import StaffDBRepository from "src/infrastructure/database/repositories/staff/staff.db-repository";
import StaffRepository from "src/infrastructure/database/repositories/staff/staff.repository";
import { StaffSeed } from "src/infrastructure/database/seeds/staff.seed";

@Module({
  imports: [TypeOrmModule.forFeature([StaffEntity])],
  providers: [
    {
      provide: StaffRepository,
      useClass: StaffDBRepository,
    },
    StaffSeed,
  ],
  exports: [StaffRepository, StaffSeed],
})
    
export class StaffModule {}
