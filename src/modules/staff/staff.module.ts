import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import StaffEntity from "src/infrastructure/database/entities/staff.entity";
import StaffDBRepository from "src/infrastructure/database/repositories/staff/staff.db-repository";
import StaffRepository from "src/infrastructure/database/repositories/staff/staff.repository";

@Module({
  imports: [TypeOrmModule.forFeature([StaffEntity])],
  providers: [
    {
      provide: StaffRepository,
      useClass: StaffDBRepository,
    },
  ],
  exports: [StaffRepository],
})
    
export class StaffModule {}
