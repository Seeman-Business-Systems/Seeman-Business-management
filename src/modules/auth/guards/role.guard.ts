import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/role-guard.decorator';
import { SUPERADMIN_ROLE } from 'src/domain/permission/permission';
import RolePermissionRepository from 'src/infrastructure/database/repositories/role-permission/role-permission.repository';
import RoleRepository from 'src/infrastructure/database/repositories/role/role.repository';

@Injectable()
export class RoleGuard implements CanActivate {
  // In-process cache: roleName → Set<permission>
  private cache = new Map<string, Set<string>>();

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionRepo: RolePermissionRepository,
    private readonly roleRepo: RoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permission required on this route — allow through
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest();
    const actor = request.user;

    if (!actor) throw new ForbiddenException('Not authenticated');

    // Resolve role name for this actor
    const role = await this.roleRepo.findByIdOrName(actor.getRoleId());
    const roleName = role?.getName();

    // Super Admin bypasses all checks
    if (roleName === SUPERADMIN_ROLE) return true;

    if (!roleName) throw new ForbiddenException('Role not found');

    // Load permissions from cache or DB
    if (!this.cache.has(roleName)) {
      const granted = await this.permissionRepo.getGrantedForRole(roleName);
      this.cache.set(roleName, new Set(granted));
    }

    const permissions = this.cache.get(roleName)!;

    if (!permissions.has(requiredPermission)) {
      throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
    }

    return true;
  }

  /** Call this after any permission update to bust the cache for a role */
  invalidateCache(roleName: string) {
    this.cache.delete(roleName);
  }
}
