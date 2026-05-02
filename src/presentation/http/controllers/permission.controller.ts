import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, UseGuards } from '@nestjs/common';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/modules/auth/guards/role.guard';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';
import RolePermissionRepository from 'src/infrastructure/database/repositories/role-permission/role-permission.repository';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RoleGuard)
class PermissionController {
  constructor(
    private readonly repo: RolePermissionRepository,
    private readonly roleGuard: RoleGuard,
  ) {}

  @Get(':roleName')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.SETTINGS_MANAGE)
  async getForRole(@Param('roleName') roleName: string) {
    return this.repo.getAllForRole(roleName);
  }

  @Patch(':roleName')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.SETTINGS_MANAGE)
  async updatePermission(
    @Param('roleName') roleName: string,
    @Body() dto: { permission: string; granted: boolean },
  ) {
    await this.repo.setPermission(roleName, dto.permission, dto.granted);
    this.roleGuard.invalidateCache(roleName);
    return this.repo.getAllForRole(roleName);
  }
}

export default PermissionController;
