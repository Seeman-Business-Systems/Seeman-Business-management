abstract class RolePermissionRepository {
  abstract getGrantedForRole(roleName: string): Promise<string[]>;
  abstract getAllForRole(roleName: string): Promise<{ permission: string; granted: boolean }[]>;
  abstract setPermission(roleName: string, permission: string, granted: boolean): Promise<void>;
  abstract seedDefaults(roleName: string, permissions: string[]): Promise<void>;
}

export default RolePermissionRepository;
