import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import RolePermissionRepository from './role-permission.repository';
import RolePermissionEntity from '../../entities/role-permission.entity';
import { Permission } from 'src/domain/permission/permission';

@Injectable()
class RolePermissionDBRepository extends RolePermissionRepository {
  constructor(
    @InjectRepository(RolePermissionEntity)
    private readonly repo: Repository<RolePermissionEntity>,
  ) {
    super();
  }

  async getGrantedForRole(roleName: string): Promise<string[]> {
    const records = await this.repo.find({ where: { roleName, granted: true } });
    return records.map((r) => r.permission);
  }

  async getAllForRole(roleName: string): Promise<{ permission: string; granted: boolean }[]> {
    const records = await this.repo.find({ where: { roleName } });
    return records.map((r) => ({ permission: r.permission, granted: r.granted }));
  }

  async setPermission(roleName: string, permission: string, granted: boolean): Promise<void> {
    await this.repo.upsert({ roleName, permission, granted }, ['roleName', 'permission']);
  }

  async seedDefaults(roleName: string, grantedPermissions: string[]): Promise<void> {
    // Backfill any permissions that don't yet have a row for this role, preserving
    // any existing rows so admin overrides are never clobbered by re-seeding.
    const existingRows = await this.repo.find({ where: { roleName } });
    const existing = new Set(existingRows.map((r) => r.permission));
    const granted = new Set(grantedPermissions);

    const missing = Object.values(Permission)
      .filter((p) => !existing.has(p))
      .map((p) => ({ roleName, permission: p, granted: granted.has(p) }));

    if (missing.length > 0) {
      await this.repo.insert(missing);
    }
  }
}

export default RolePermissionDBRepository;
