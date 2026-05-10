import { Fragment } from 'react';
import { useGetRolesQuery } from '../../store/api/rolesApi';
import { useGetRolePermissionsQuery, useUpdatePermissionMutation } from '../../store/api/permissionsApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const PERMISSION_GROUPS = [
  {
    label: 'Sales',
    permissions: [
      { key: 'sale:read', label: 'View Sales' },
      { key: 'sale:create', label: 'Create Sale' },
      { key: 'sale:update', label: 'Update Sale' },
      { key: 'sale:cancel', label: 'Cancel Sale' },
      { key: 'payment:record', label: 'Record Payment' },
    ],
  },
  {
    label: 'Products',
    permissions: [
      { key: 'product:read', label: 'View Products' },
      { key: 'product:create', label: 'Create Product' },
      { key: 'product:update', label: 'Update Product' },
      { key: 'product:delete', label: 'Delete Product' },
      { key: 'brand:manage', label: 'Manage Brands' },
      { key: 'category:manage', label: 'Manage Categories' },
    ],
  },
  {
    label: 'Inventory',
    permissions: [
      { key: 'inventory:read', label: 'View Inventory' },
      { key: 'inventory:adjust', label: 'Adjust Inventory' },
      { key: 'inventory:transfer', label: 'Transfer Inventory' },
    ],
  },
  {
    label: 'Supplies',
    permissions: [
      { key: 'supply:read', label: 'View Supplies' },
      { key: 'supply:fulfil', label: 'Fulfil Supply' },
      { key: 'supply:cancel', label: 'Cancel Supply' },
    ],
  },
  {
    label: 'Customers',
    permissions: [
      { key: 'customer:read', label: 'View Customers' },
      { key: 'customer:create', label: 'Create Customer' },
      { key: 'customer:update', label: 'Update Customer' },
      { key: 'customer:delete', label: 'Delete Customer' },
    ],
  },
  {
    label: 'Expenses',
    permissions: [
      { key: 'expense:read', label: 'View Expenses' },
      { key: 'expense:create', label: 'Create Expense' },
      { key: 'expense:update', label: 'Update Expense' },
      { key: 'expense:delete', label: 'Delete Expense' },
    ],
  },
  {
    label: 'Staff',
    permissions: [
      { key: 'staff:read', label: 'View Staff' },
      { key: 'staff:create', label: 'Add Staff' },
      { key: 'staff:transfer', label: 'Transfer Staff' },
      { key: 'staff:delete', label: 'Delete Staff' },
    ],
  },
  {
    label: 'Branches & Warehouses',
    permissions: [
      { key: 'branch:read', label: 'View Branches' },
      { key: 'branch:create', label: 'Create Branch' },
      { key: 'branch:update', label: 'Update Branch' },
      { key: 'warehouse:read', label: 'View Warehouses' },
      { key: 'warehouse:create', label: 'Create Warehouse' },
      { key: 'warehouse:update', label: 'Update Warehouse' },
    ],
  },
  {
    label: 'Reports & Activities',
    permissions: [
      { key: 'dashboard:view', label: 'View Dashboard' },
      { key: 'analytics:read', label: 'View Reports' },
      { key: 'activity:read', label: 'View Activities' },
      { key: 'filter:by-branch', label: 'Filter by Branch' },
      { key: 'branch:select-on-create', label: 'Select Branch on Create' },
    ],
  },
  {
    label: 'Admin',
    permissions: [
      { key: 'role:read', label: 'View Roles' },
      { key: 'role:manage', label: 'Manage Roles' },
      { key: 'settings:manage', label: 'System Settings' },
    ],
  },
];

const EXCLUDED_ROLES = ['Super Admin'];
const ROLE_ORDER = ['CEO', 'Branch Manager', 'Sales Rep', 'Apprentice'] as const;
const ROLE_ORDER_INDEX = Object.fromEntries(
  ROLE_ORDER.map((name, index) => [name, index]),
);

function PermissionsTab() {
  const { data: allRoles = [] } = useGetRolesQuery();
  const managedRoles = allRoles
    .filter((r) => !EXCLUDED_ROLES.includes(r.name))
    .sort((a, b) => {
      const left = ROLE_ORDER_INDEX[a.name] ?? Number.MAX_SAFE_INTEGER;
      const right = ROLE_ORDER_INDEX[b.name] ?? Number.MAX_SAFE_INTEGER;
      if (left !== right) return left - right;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left font-semibold text-gray-700 py-2 pr-4 w-44">Permission</th>
            {managedRoles.map((role) => (
              <th key={role.id} className="text-center font-semibold text-gray-700 py-2 px-4 min-w-[120px]">
                {role.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_GROUPS.map((group) => (
            <Fragment key={group.label}>
              <tr>
                <td colSpan={managedRoles.length + 1} className="pt-5 pb-1">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    {group.label}
                  </span>
                </td>
              </tr>
              {group.permissions.map((p) => (
                <tr key={p.key} className="border-b border-gray-50">
                  <td className="py-2 pr-4 text-gray-600">{p.label}</td>
                  {managedRoles.map((role) => (
                    <td key={role.id} className="py-2 px-4 text-center">
                      <RoleColumnCell roleName={role.name} permission={p.key} />
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PERMISSION_LABEL: Record<string, string> = Object.fromEntries(
  PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => [p.key, p.label])),
);

function RoleColumnCell({ roleName, permission }: { roleName: string; permission: string }) {
  const { data: permissions = [], isLoading } = useGetRolePermissionsQuery(roleName);
  const [updatePermission] = useUpdatePermissionMutation();
  const { showToast } = useToast();
  const { user, refreshPermissions } = useAuth();

  const record = permissions.find((p) => p.permission === permission);
  const granted = record?.granted ?? false;

  const toggle = async () => {
    const next = !granted;
    try {
      await updatePermission({ roleName, permission, granted: next }).unwrap();
      const label = PERMISSION_LABEL[permission] ?? permission;
      showToast('success', `${label} ${next ? 'granted to' : 'revoked from'} ${roleName}`);
      if (user?.role?.name === roleName) {
        await refreshPermissions();
      }
    } catch {
      showToast('error', 'Failed to update permission');
    }
  };

  if (isLoading) return <div className="h-5 w-9 bg-gray-100 rounded-full mx-auto animate-pulse" />;

  return (
    <button
      onClick={toggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        granted ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          granted ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default PermissionsTab;
