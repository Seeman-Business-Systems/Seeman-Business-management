import { Injectable } from '@nestjs/common';
import RoleRepository from 'src/infrastructure/database/repositories/role/role.repository';
import RolePermissionRepository from 'src/infrastructure/database/repositories/role-permission/role-permission.repository';
import { Permission } from 'src/domain/permission/permission';
import Staff from 'src/domain/staff/staff';

@Injectable()
class BranchScope {
  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly permissionRepo: RolePermissionRepository,
  ) {}

  /**
   * True when the actor is allowed to see data across branches —
   * either a management role or any role granted the
   * `filter:by-branch` permission.
   */
  async canFilterByBranch(actor: Staff): Promise<boolean> {
    const role = await this.roleRepo.findByIdOrName(actor.getRoleId());
    const roleName = role?.getName() ?? '';
    if (role?.IsManagement()) return true;
    const granted = await this.permissionRepo.getGrantedForRole(roleName);
    return granted.includes(Permission.FILTER_BY_BRANCH);
  }

  /**
   * For roles with `filter:by-branch`, pass through the requested branchId.
   * Otherwise, force scoping to the actor's own branch.
   */
  async resolve(actor: Staff, requestedBranchId?: number): Promise<number | undefined> {
    const allowed = await this.canFilterByBranch(actor);
    return allowed ? requestedBranchId : actor.getBranchId();
  }
}

export default BranchScope;
