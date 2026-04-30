import { SetMetadata } from '@nestjs/common';
import type { PermissionKey } from 'src/domain/permission/permission';

export const PERMISSION_KEY = 'required_permission';

export const RequirePermission = (permission: PermissionKey) =>
  SetMetadata(PERMISSION_KEY, permission);

