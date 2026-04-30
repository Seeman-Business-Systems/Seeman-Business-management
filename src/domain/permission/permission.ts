export const Permission = {
  // Sales
  SALE_READ:    'sale:read',
  SALE_CREATE:  'sale:create',
  SALE_UPDATE:  'sale:update',
  SALE_CANCEL:  'sale:cancel',
  SALE_FULFIL:  'sale:fulfil',

  // Payments
  PAYMENT_RECORD: 'payment:record',

  // Expenses
  EXPENSE_READ:   'expense:read',
  EXPENSE_CREATE: 'expense:create',
  EXPENSE_UPDATE: 'expense:update',
  EXPENSE_DELETE: 'expense:delete',

  // Products
  PRODUCT_READ:   'product:read',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',

  // Inventory
  INVENTORY_READ:     'inventory:read',
  INVENTORY_ADJUST:   'inventory:adjust',
  INVENTORY_TRANSFER: 'inventory:transfer',

  // Supplies
  SUPPLY_READ:   'supply:read',
  SUPPLY_FULFIL: 'supply:fulfil',
  SUPPLY_CANCEL: 'supply:cancel',

  // Customers
  CUSTOMER_READ:   'customer:read',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_UPDATE: 'customer:update',
  CUSTOMER_DELETE: 'customer:delete',

  // Staff
  STAFF_READ:     'staff:read',
  STAFF_CREATE:   'staff:create',
  STAFF_TRANSFER: 'staff:transfer',
  STAFF_DELETE:   'staff:delete',

  // Branches
  BRANCH_READ:   'branch:read',
  BRANCH_CREATE: 'branch:create',
  BRANCH_UPDATE: 'branch:update',

  // Warehouses
  WAREHOUSE_READ:   'warehouse:read',
  WAREHOUSE_CREATE: 'warehouse:create',
  WAREHOUSE_UPDATE: 'warehouse:update',

  // Roles
  ROLE_READ:   'role:read',
  ROLE_MANAGE: 'role:manage',

  // Analytics / Reports
  ANALYTICS_READ: 'analytics:read',

  // Activities
  ACTIVITY_READ: 'activity:read',

  // Brands & Categories
  BRAND_MANAGE:    'brand:manage',
  CATEGORY_MANAGE: 'category:manage',

  // Settings (SuperAdmin only)
  SETTINGS_MANAGE: 'settings:manage',
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];

export const SUPERADMIN_ROLE = 'Super Admin';
