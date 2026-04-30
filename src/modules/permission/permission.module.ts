import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import RolePermissionEntity from 'src/infrastructure/database/entities/role-permission.entity';
import RolePermissionRepository from 'src/infrastructure/database/repositories/role-permission/role-permission.repository';
import RolePermissionDBRepository from 'src/infrastructure/database/repositories/role-permission/role-permission.db-repository';
import { RolePermissionSeed } from 'src/infrastructure/database/seeds/role-permission.seed';
import PermissionController from 'src/presentation/http/controllers/permission.controller';
import { RoleGuard } from 'src/modules/auth/guards/role.guard';
import { RoleModule } from 'src/modules/role/role.module';

@Module({
  imports: [TypeOrmModule.forFeature([RolePermissionEntity]), RoleModule],
  controllers: [PermissionController],
  providers: [
    {
      provide: RolePermissionRepository,
      useClass: RolePermissionDBRepository,
    },
    RolePermissionSeed,
    RoleGuard,
  ],
  exports: [RolePermissionRepository, RolePermissionSeed, RoleGuard],
})
export class PermissionModule {}
