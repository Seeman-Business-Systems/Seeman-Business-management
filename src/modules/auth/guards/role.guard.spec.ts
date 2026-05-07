import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.guard';
import { Permission, SUPERADMIN_ROLE } from 'src/domain/permission/permission';
import Role from 'src/domain/role/role';
import RolePermissionRepository from 'src/infrastructure/database/repositories/role-permission/role-permission.repository';
import RoleRepository from 'src/infrastructure/database/repositories/role/role.repository';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: jest.Mocked<Reflector>;
  let permissionRepo: jest.Mocked<RolePermissionRepository>;
  let roleRepo: jest.Mocked<RoleRepository>;

  const buildContext = (actor: { getRoleId: () => number } | null): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user: actor }) }),
      getHandler: () => undefined,
      getClass: () => undefined,
    }) as unknown as ExecutionContext;

  const buildRole = (id: number, name: string) =>
    new Role(id, name, false, 0, new Date(), new Date());

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    permissionRepo = {
      getGrantedForRole: jest.fn(),
      getAllForRole: jest.fn(),
      setPermission: jest.fn(),
      seedDefaults: jest.fn(),
    } as unknown as jest.Mocked<RolePermissionRepository>;
    roleRepo = {
      findByIdOrName: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn(),
    } as unknown as jest.Mocked<RoleRepository>;
    guard = new RoleGuard(reflector, permissionRepo, roleRepo);
  });

  it('allows the request when no permission is required on the route', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    await expect(guard.canActivate(buildContext({ getRoleId: () => 1 }))).resolves.toBe(true);
  });

  it('rejects unauthenticated requests with ForbiddenException', async () => {
    reflector.getAllAndOverride.mockReturnValue(Permission.SALE_READ);
    await expect(guard.canActivate(buildContext(null))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lets a Super Admin bypass all permission checks', async () => {
    reflector.getAllAndOverride.mockReturnValue(Permission.SETTINGS_MANAGE);
    roleRepo.findByIdOrName.mockResolvedValue(buildRole(1, SUPERADMIN_ROLE));
    await expect(guard.canActivate(buildContext({ getRoleId: () => 1 }))).resolves.toBe(true);
    expect(permissionRepo.getGrantedForRole).not.toHaveBeenCalled();
  });

  it('grants access when the role has the required permission', async () => {
    reflector.getAllAndOverride.mockReturnValue(Permission.SALE_CREATE);
    roleRepo.findByIdOrName.mockResolvedValue(buildRole(4, 'Sales Rep'));
    permissionRepo.getGrantedForRole.mockResolvedValue([Permission.SALE_CREATE]);
    await expect(guard.canActivate(buildContext({ getRoleId: () => 4 }))).resolves.toBe(true);
  });

  it('denies access with a descriptive message when the role lacks the permission', async () => {
    reflector.getAllAndOverride.mockReturnValue(Permission.ANALYTICS_READ);
    roleRepo.findByIdOrName.mockResolvedValue(buildRole(4, 'Sales Rep'));
    permissionRepo.getGrantedForRole.mockResolvedValue([Permission.SALE_READ]);
    await expect(guard.canActivate(buildContext({ getRoleId: () => 4 }))).rejects.toThrow(
      /Missing permission: analytics:read/,
    );
  });

  it('rejects when the role itself cannot be resolved (tampered token id)', async () => {
    reflector.getAllAndOverride.mockReturnValue(Permission.SALE_READ);
    roleRepo.findByIdOrName.mockResolvedValue(null);
    await expect(guard.canActivate(buildContext({ getRoleId: () => 999 }))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('caches per-role permissions to avoid repeat database lookups', async () => {
    reflector.getAllAndOverride.mockReturnValue(Permission.SALE_READ);
    roleRepo.findByIdOrName.mockResolvedValue(buildRole(4, 'Sales Rep'));
    permissionRepo.getGrantedForRole.mockResolvedValue([Permission.SALE_READ]);

    await guard.canActivate(buildContext({ getRoleId: () => 4 }));
    await guard.canActivate(buildContext({ getRoleId: () => 4 }));

    expect(permissionRepo.getGrantedForRole).toHaveBeenCalledTimes(1);
  });

  it('reloads permissions after invalidateCache is called', async () => {
    reflector.getAllAndOverride.mockReturnValue(Permission.SALE_READ);
    roleRepo.findByIdOrName.mockResolvedValue(buildRole(4, 'Sales Rep'));
    permissionRepo.getGrantedForRole.mockResolvedValue([Permission.SALE_READ]);

    await guard.canActivate(buildContext({ getRoleId: () => 4 }));
    guard.invalidateCache('Sales Rep');
    await guard.canActivate(buildContext({ getRoleId: () => 4 }));

    expect(permissionRepo.getGrantedForRole).toHaveBeenCalledTimes(2);
  });

  it('denies a Sales Rep that lacks role:manage when accessing role admin routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(Permission.ROLE_MANAGE);
    roleRepo.findByIdOrName.mockResolvedValue(buildRole(4, 'Sales Rep'));
    permissionRepo.getGrantedForRole.mockResolvedValue([Permission.SALE_READ, Permission.SALE_CREATE]);
    await expect(guard.canActivate(buildContext({ getRoleId: () => 4 }))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('grants a Branch Manager that has been provisioned the required permission', async () => {
    reflector.getAllAndOverride.mockReturnValue(Permission.SUPPLY_FULFIL);
    roleRepo.findByIdOrName.mockResolvedValue(buildRole(3, 'Branch Manager'));
    permissionRepo.getGrantedForRole.mockResolvedValue([
      Permission.SUPPLY_READ,
      Permission.SUPPLY_FULFIL,
    ]);
    await expect(guard.canActivate(buildContext({ getRoleId: () => 3 }))).resolves.toBe(true);
  });
});
