import { Injectable } from '@nestjs/common';
import { Permission } from 'src/domain/permission/permission';
import RolePermissionRepository from '../repositories/role-permission/role-permission.repository';

const DEFAULTS: Record<string, string[]> = {
  'CEO': [
    Permission.SALE_READ, Permission.SALE_CANCEL,
    Permission.PRODUCT_READ,
    Permission.INVENTORY_READ,
    Permission.SUPPLY_READ,
    Permission.CUSTOMER_READ,
    Permission.EXPENSE_READ,
    Permission.DASHBOARD_VIEW,
    Permission.ANALYTICS_READ,
    Permission.ACTIVITY_READ,
    Permission.BRANCH_READ,
    Permission.WAREHOUSE_READ,
    Permission.ROLE_READ,
    Permission.FILTER_BY_BRANCH,
  ],

  'Branch Manager': [
    Permission.SALE_READ, Permission.SALE_CREATE, Permission.SALE_UPDATE, Permission.SALE_CANCEL,
    Permission.PAYMENT_RECORD,
    Permission.EXPENSE_READ, Permission.EXPENSE_CREATE, Permission.EXPENSE_UPDATE, Permission.EXPENSE_DELETE,
    Permission.PRODUCT_READ, Permission.PRODUCT_CREATE, Permission.PRODUCT_UPDATE,
    Permission.INVENTORY_READ, Permission.INVENTORY_ADJUST, Permission.INVENTORY_TRANSFER,
    Permission.SUPPLY_READ, Permission.SUPPLY_FULFIL, Permission.SUPPLY_CANCEL,
    Permission.CUSTOMER_READ, Permission.CUSTOMER_CREATE, Permission.CUSTOMER_UPDATE,
    Permission.STAFF_READ, Permission.STAFF_CREATE, Permission.STAFF_TRANSFER,
    Permission.BRANCH_READ,
    Permission.WAREHOUSE_READ, Permission.WAREHOUSE_CREATE, Permission.WAREHOUSE_UPDATE,
    Permission.ROLE_READ,
    Permission.DASHBOARD_VIEW,
    Permission.ANALYTICS_READ,
    Permission.ACTIVITY_READ,
    Permission.BRAND_MANAGE, Permission.CATEGORY_MANAGE,
  ],

  'Sales Rep': [
    Permission.SALE_READ, Permission.SALE_CREATE, Permission.SALE_UPDATE,
    Permission.PAYMENT_RECORD,
    Permission.PRODUCT_READ, Permission.PRODUCT_CREATE, Permission.PRODUCT_UPDATE,
    Permission.INVENTORY_READ,
    Permission.SUPPLY_READ, Permission.SUPPLY_FULFIL,
    Permission.CUSTOMER_READ, Permission.CUSTOMER_CREATE, Permission.CUSTOMER_UPDATE,
    Permission.DASHBOARD_VIEW,
    Permission.ACTIVITY_READ,
  ],

  'Apprentice': [
    Permission.PRODUCT_READ,
    Permission.INVENTORY_READ,
    Permission.SALE_READ,
    Permission.SUPPLY_READ, Permission.SUPPLY_FULFIL,
    Permission.DASHBOARD_VIEW,
    Permission.ACTIVITY_READ,
  ],
};

@Injectable()
export class RolePermissionSeed {
  constructor(private readonly repo: RolePermissionRepository) {}

  async seed() {
    for (const [roleName, permissions] of Object.entries(DEFAULTS)) {
      await this.repo.seedDefaults(roleName, permissions);
    }
    console.log('✅ Role permissions seeded');
  }
}
