/**
 * Seeds sample activities for testing.
 * Run: node scripts/seed-activities.js
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const rows = [
  // ── Staff 10 (Adamma Nkechi) ──────────────────────────────────────────────
  {
    type: 'SALE_CREATED', actor_id: 10, entity_type: 'Sale', entity_id: 101,
    entity_label: 'SAL-2026-04-001', branch_id: 4, warehouse_id: null,
    metadata: { saleNumber: 'SAL-2026-04-001', totalAmount: 85000, items: [{ variantName: 'Brake Pad (Toyota)', quantity: 4 }, { variantName: 'Engine Oil 5W30', quantity: 2 }] },
    created_at: '2026-04-18 09:14:00',
  },
  {
    type: 'PAYMENT_RECORDED', actor_id: 10, entity_type: 'Sale', entity_id: 101,
    entity_label: 'SAL-2026-04-001', branch_id: 4, warehouse_id: null,
    metadata: { amount: 50000, saleNumber: 'SAL-2026-04-001' },
    created_at: '2026-04-18 10:02:00',
  },
  {
    type: 'SALE_CREATED', actor_id: 10, entity_type: 'Sale', entity_id: 102,
    entity_label: 'SAL-2026-04-002', branch_id: 4, warehouse_id: null,
    metadata: { saleNumber: 'SAL-2026-04-002', totalAmount: 32000, items: [{ variantName: 'Shock Absorber (Nissan)', quantity: 2 }] },
    created_at: '2026-04-18 11:30:00',
  },
  {
    type: 'PAYMENT_RECORDED', actor_id: 10, entity_type: 'Sale', entity_id: 102,
    entity_label: 'SAL-2026-04-002', branch_id: 4, warehouse_id: null,
    metadata: { amount: 32000, saleNumber: 'SAL-2026-04-002' },
    created_at: '2026-04-18 11:45:00',
  },
  {
    type: 'CUSTOMER_CREATED', actor_id: 10, entity_type: 'Customer', entity_id: 55,
    entity_label: 'Emeka Okafor', branch_id: 4, warehouse_id: null,
    metadata: { name: 'Emeka Okafor' },
    created_at: '2026-04-18 14:00:00',
  },
  {
    type: 'SALE_CREATED', actor_id: 10, entity_type: 'Sale', entity_id: 103,
    entity_label: 'SAL-2026-04-003', branch_id: 4, warehouse_id: null,
    metadata: { saleNumber: 'SAL-2026-04-003', totalAmount: 120000, items: [{ variantName: 'Radiator (Honda Accord)', quantity: 1 }, { variantName: 'Coolant 1L', quantity: 3 }, { variantName: 'Thermostat', quantity: 1 }] },
    created_at: '2026-04-19 08:55:00',
  },
  {
    type: 'SALE_CANCELLED', actor_id: 10, entity_type: 'Sale', entity_id: 104,
    entity_label: 'SAL-2026-04-004', branch_id: 4, warehouse_id: null,
    metadata: { saleNumber: 'SAL-2026-04-004', totalAmount: 45000 },
    created_at: '2026-04-19 09:40:00',
  },
  {
    type: 'PAYMENT_RECORDED', actor_id: 10, entity_type: 'Sale', entity_id: 103,
    entity_label: 'SAL-2026-04-003', branch_id: 4, warehouse_id: null,
    metadata: { amount: 120000, saleNumber: 'SAL-2026-04-003' },
    created_at: '2026-04-19 10:15:00',
  },
  {
    type: 'CUSTOMER_CREATED', actor_id: 10, entity_type: 'Customer', entity_id: 56,
    entity_label: 'Ngozi Eze', branch_id: 4, warehouse_id: null,
    metadata: { name: 'Ngozi Eze' },
    created_at: '2026-04-19 13:20:00',
  },
  {
    type: 'SALE_CREATED', actor_id: 10, entity_type: 'Sale', entity_id: 105,
    entity_label: 'SAL-2026-04-005', branch_id: 4, warehouse_id: null,
    metadata: { saleNumber: 'SAL-2026-04-005', totalAmount: 67500, items: [{ variantName: 'Clutch Plate (Toyota Camry)', quantity: 1 }, { variantName: 'Bearing Kit', quantity: 2 }] },
    created_at: '2026-04-20 08:10:00',
  },

  // ── Head Office Branch (id=1) ─────────────────────────────────────────────
  {
    type: 'BRANCH_CREATED', actor_id: 1, entity_type: 'Branch', entity_id: 4,
    entity_label: 'Onitsha Branch', branch_id: 1, warehouse_id: null,
    metadata: { name: 'Onitsha Branch', code: 'ONT-01' },
    created_at: '2026-03-10 10:00:00',
  },
  {
    type: 'STAFF_REGISTERED', actor_id: 1, entity_type: 'Staff', entity_id: 10,
    entity_label: 'Adamma Nkechi', branch_id: 1, warehouse_id: null,
    metadata: { name: 'Adamma Nkechi', staffId: 10 },
    created_at: '2026-03-15 09:00:00',
  },
  {
    type: 'PRODUCT_CREATED', actor_id: 1, entity_type: 'Product', entity_id: 20,
    entity_label: 'Brake Pad (Toyota)', branch_id: 1, warehouse_id: null,
    metadata: { name: 'Brake Pad (Toyota)' },
    created_at: '2026-03-20 11:30:00',
  },
  {
    type: 'WAREHOUSE_CREATED', actor_id: 1, entity_type: 'Warehouse', entity_id: 1,
    entity_label: 'Onitsha Central Warehouse', branch_id: 1, warehouse_id: 1,
    metadata: { name: 'Onitsha Central Warehouse' },
    created_at: '2026-03-08 14:00:00',
  },

  // ── Lagos Island Branch (id=2) ────────────────────────────────────────────
  {
    type: 'SALE_CREATED', actor_id: 3, entity_type: 'Sale', entity_id: 201,
    entity_label: 'SAL-2026-04-010', branch_id: 2, warehouse_id: null,
    metadata: { saleNumber: 'SAL-2026-04-010', totalAmount: 95000, items: [{ variantName: 'Air Filter', quantity: 6 }, { variantName: 'Spark Plug', quantity: 8 }] },
    created_at: '2026-04-17 10:30:00',
  },
  {
    type: 'PAYMENT_RECORDED', actor_id: 3, entity_type: 'Sale', entity_id: 201,
    entity_label: 'SAL-2026-04-010', branch_id: 2, warehouse_id: null,
    metadata: { amount: 95000, saleNumber: 'SAL-2026-04-010' },
    created_at: '2026-04-17 11:00:00',
  },
  {
    type: 'INVENTORY_ADJUSTED', actor_id: 3, entity_type: 'InventoryBatch', entity_id: 12,
    entity_label: null, branch_id: 2, warehouse_id: 4,
    metadata: { batchId: 12, adjustmentQuantity: -5 },
    created_at: '2026-04-17 15:45:00',
  },

  // ── Abuja Branch (id=3) ───────────────────────────────────────────────────
  {
    type: 'SALE_CREATED', actor_id: 4, entity_type: 'Sale', entity_id: 301,
    entity_label: 'SAL-2026-04-020', branch_id: 3, warehouse_id: null,
    metadata: { saleNumber: 'SAL-2026-04-020', totalAmount: 210000, items: [{ variantName: 'Alternator (Mercedes)', quantity: 1 }, { variantName: 'Drive Belt', quantity: 2 }] },
    created_at: '2026-04-16 09:00:00',
  },
  {
    type: 'INVENTORY_TRANSFERRED', actor_id: 4, entity_type: 'InventoryBatch', entity_id: null,
    entity_label: null, branch_id: 3, warehouse_id: 3,
    metadata: { quantity: 10, fromWarehouseId: 1, toWarehouseId: 3 },
    created_at: '2026-04-15 13:00:00',
  },

  // ── Onitsha Central Warehouse (id=1, branch_id=1) ─────────────────────────
  {
    type: 'INVENTORY_ADJUSTED', actor_id: 2, entity_type: 'InventoryBatch', entity_id: 5,
    entity_label: null, branch_id: 1, warehouse_id: 1,
    metadata: { batchId: 5, adjustmentQuantity: 20 },
    created_at: '2026-04-14 10:00:00',
  },
  {
    type: 'INVENTORY_TRANSFERRED', actor_id: 2, entity_type: 'InventoryBatch', entity_id: null,
    entity_label: null, branch_id: 1, warehouse_id: 1,
    metadata: { quantity: 15, fromWarehouseId: 1, toWarehouseId: 2 },
    created_at: '2026-04-14 11:30:00',
  },
  {
    type: 'SUPPLY_CREATED', actor_id: null, entity_type: 'Supply', entity_id: 1,
    entity_label: 'SUP-2026-04-001', branch_id: 1, warehouse_id: null,
    metadata: { supplyNumber: 'SUP-2026-04-001', saleId: 101, itemCount: 2 },
    created_at: '2026-04-18 09:15:00',
  },

  // ── Onitsha Main Market Plaza (id=2, branch_id=4) ─────────────────────────
  {
    type: 'INVENTORY_ADJUSTED', actor_id: 5, entity_type: 'InventoryBatch', entity_id: 8,
    entity_label: null, branch_id: 4, warehouse_id: 2,
    metadata: { batchId: 8, adjustmentQuantity: 30 },
    created_at: '2026-04-13 09:20:00',
  },
  {
    type: 'INVENTORY_TRANSFERRED', actor_id: 5, entity_type: 'InventoryBatch', entity_id: null,
    entity_label: null, branch_id: 4, warehouse_id: 2,
    metadata: { quantity: 5, fromWarehouseId: 2, toWarehouseId: 4 },
    created_at: '2026-04-13 14:00:00',
  },
];

async function seed() {
  await client.connect();
  console.log('Connected. Seeding activities…');

  let inserted = 0;
  for (const row of rows) {
    await client.query(
      `INSERT INTO activities (type, actor_id, entity_type, entity_id, entity_label, branch_id, warehouse_id, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        row.type,
        row.actor_id ?? null,
        row.entity_type,
        row.entity_id ?? null,
        row.entity_label ?? null,
        row.branch_id ?? null,
        row.warehouse_id ?? null,
        row.metadata ? JSON.stringify(row.metadata) : null,
        row.created_at,
      ],
    );
    inserted++;
  }

  console.log(`Done. Inserted ${inserted} activities.`);
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
