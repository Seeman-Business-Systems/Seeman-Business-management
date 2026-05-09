import type { Activity, ActivityType } from '../types/activity';

function formatAmount(amount: unknown): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0));
}

function itemList(items: Array<{ variantName?: string | null; quantity: number }>): string {
  if (!items || items.length === 0) return 'items';
  if (items.length === 1) {
    const i = items[0];
    return `${i.quantity}x ${i.variantName ?? 'item'}`;
  }
  if (items.length <= 3) {
    return items.map((i) => `${i.quantity}x ${i.variantName ?? 'item'}`).join(', ');
  }
  const first = items.slice(0, 2).map((i) => `${i.quantity}x ${i.variantName ?? 'item'}`).join(', ');
  return `${first} and ${items.length - 2} more`;
}

type Generator = (meta: Record<string, unknown>) => string;

const generators: Record<ActivityType, Generator> = {
  SALE_CREATED: (meta) => {
    const items = meta.items as Array<{ variantName?: string | null; quantity: number }> | undefined;
    const total = formatAmount(meta.totalAmount);
    const itemText = items ? itemList(items) : `${meta.itemCount ?? '?'} item(s)`;
    return `Created sale ${meta.saleNumber} — ${itemText} for ${total}`;
  },

  SALE_CANCELLED: (meta) =>
    `Cancelled sale ${meta.saleNumber} (${formatAmount(meta.totalAmount)})`,

  PAYMENT_RECORDED: (meta) =>
    `Recorded payment of ${formatAmount(meta.amount)} on sale ${meta.saleNumber}`,

  INVENTORY_ADJUSTED: (meta) => {
    const qty = Number(meta.adjustmentQuantity ?? 0);
    const direction = qty >= 0 ? `+${qty}` : `${qty}`;
    return `Adjusted inventory batch #${meta.batchId} by ${direction} units`;
  },

  INVENTORY_TRANSFERRED: (meta) =>
    `Transferred ${meta.quantity} unit(s) from warehouse #${meta.fromWarehouseId} to warehouse #${meta.toWarehouseId}`,

  PRODUCT_CREATED: (meta) =>
    `Added new product "${meta.name}"`,

  BRANCH_CREATED: (meta) =>
    `Created branch "${meta.name}"${meta.code ? ` (${meta.code})` : ''}`,

  WAREHOUSE_CREATED: (meta) =>
    `Created warehouse "${meta.name}"`,

  CUSTOMER_CREATED: (meta) =>
    `Added new customer "${meta.name}"`,

  STAFF_REGISTERED: (meta) =>
    `Registered new staff member "${meta.name ?? `#${meta.staffId}`}"`,

  SUPPLY_CREATED: (meta) =>
    `Supply ${meta.supplyNumber} opened as draft for sale ${meta.saleId} (${meta.itemCount} item(s))`,

  SUPPLY_FULFILLED: (meta) =>
    `Marked supply ${meta.supplyNumber} as fulfilled`,

  STAFF_TRANSFERRED: (meta) =>
    `Transferred ${meta.staffName} from ${meta.fromBranchName} to ${meta.toBranchName}`,

  EXPENSE_RECORDED: (meta) => {
    const amount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(meta.amount ?? 0));
    const cat = String(meta.category ?? '').charAt(0) + String(meta.category ?? '').slice(1).toLowerCase();
    return `Recorded ${amount} expense (${cat})${meta.description ? ` — "${meta.description}"` : ''}`;
  },

  CONTAINER_OFFLOADED: (meta) =>
    `Offloaded container ${meta.batchNumber} — ${meta.itemCount} item(s), ${meta.totalUnits} units`,
};

export function generateActivityText(activity: Activity): string {
  const meta = activity.metadata ?? {};
  const generator = generators[activity.type];
  if (!generator) return `${activity.type.toLowerCase().replace(/_/g, ' ')}`;
  try {
    return generator(meta);
  } catch {
    return activity.type.toLowerCase().replace(/_/g, ' ');
  }
}
