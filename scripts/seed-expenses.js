/**
 * Seeds sample expenses across branches.
 * Run: node scripts/seed-expenses.js
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

// branch_id → staff_id (manager/recorder)
// 1 = Head Office    → Paschal (1)
// 2 = Lagos Island   → Ozara (5)
// 3 = Abuja Central  → Adamma (10)
// 4 = Onitsha        → Paul (7)

const expenses = [
  // ── Head Office (branch 1) ────────────────────────────────────────────────
  { amount: 350000, category: 'RENT',            description: 'Office rent — April 2026',              branch_id: 1, recorded_by: 1, date: '2026-04-01', notes: 'Paid via bank transfer' },
  { amount: 42000,  category: 'UTILITIES',       description: 'Electricity bill — April',              branch_id: 1, recorded_by: 1, date: '2026-04-03', notes: null },
  { amount: 18500,  category: 'UTILITIES',       description: 'Internet subscription — April',         branch_id: 1, recorded_by: 2, date: '2026-04-05', notes: null },
  { amount: 95000,  category: 'SALARIES',        description: 'Driver & security salaries — April',    branch_id: 1, recorded_by: 1, date: '2026-04-07', notes: null },
  { amount: 28000,  category: 'MAINTENANCE',     description: 'Generator servicing',                   branch_id: 1, recorded_by: 3, date: '2026-04-10', notes: 'Annual service' },
  { amount: 35000,  category: 'WAYBILLFEES',     description: 'GIG courier waybill — April batch 1',   branch_id: 1, recorded_by: 2, date: '2026-04-12', notes: null },
  { amount: 12000,  category: 'MISCELLANEOUS',   description: 'Office supplies and stationery',        branch_id: 1, recorded_by: 4, date: '2026-04-14', notes: null },
  { amount: 8500,   category: 'FEEDING',         description: 'Staff lunch — office team April',       branch_id: 1, recorded_by: 3, date: '2026-04-15', notes: null },
  { amount: 14000,  category: 'DAILY_TRANSPORT', description: 'Driver fuel allowance — April wk 1-2',  branch_id: 1, recorded_by: 4, date: '2026-04-15', notes: null },

  // ── Lagos Island Branch (branch 2) ────────────────────────────────────────
  { amount: 280000, category: 'RENT',            description: 'Shop rent — April 2026',                branch_id: 2, recorded_by: 5, date: '2026-04-01', notes: 'Quarterly payment split' },
  { amount: 33000,  category: 'UTILITIES',       description: 'Electricity bill — April',              branch_id: 2, recorded_by: 5, date: '2026-04-04', notes: null },
  { amount: 27000,  category: 'WAYBILLFEES',     description: 'DHL & GIG waybill fees — April',        branch_id: 2, recorded_by: 8, date: '2026-04-08', notes: null },
  { amount: 15000,  category: 'MAINTENANCE',     description: 'AC unit repair',                        branch_id: 2, recorded_by: 8, date: '2026-04-11', notes: null },
  { amount: 9500,   category: 'MISCELLANEOUS',   description: 'Cleaning supplies',                     branch_id: 2, recorded_by: 8, date: '2026-04-17', notes: null },
  { amount: 7200,   category: 'FEEDING',         description: 'Staff feeding — April',                 branch_id: 2, recorded_by: 5, date: '2026-04-16', notes: null },
  { amount: 11000,  category: 'DAILY_TRANSPORT', description: 'Staff transport allowance — April',     branch_id: 2, recorded_by: 5, date: '2026-04-16', notes: null },

  // ── Abuja Central Branch (branch 3) ──────────────────────────────────────
  { amount: 320000, category: 'RENT',            description: 'Premises rent — April 2026',            branch_id: 3, recorded_by: 10, date: '2026-04-01', notes: null },
  { amount: 29000,  category: 'UTILITIES',       description: 'AEDC electricity bill',                 branch_id: 3, recorded_by: 10, date: '2026-04-05', notes: null },
  { amount: 16000,  category: 'UTILITIES',       description: 'Water bill — Q1',                      branch_id: 3, recorded_by: 6,  date: '2026-04-06', notes: null },
  { amount: 41000,  category: 'WAYBILLFEES',     description: 'Outbound waybill fees — April',         branch_id: 3, recorded_by: 10, date: '2026-04-09', notes: null },
  { amount: 8000,   category: 'MISCELLANEOUS',   description: 'Staff refreshments — April',            branch_id: 3, recorded_by: 10, date: '2026-04-18', notes: null },
  { amount: 9500,   category: 'FEEDING',         description: 'Staff lunch allowance — April',         branch_id: 3, recorded_by: 6,  date: '2026-04-13', notes: null },
  { amount: 13500,  category: 'DAILY_TRANSPORT', description: 'Bike dispatch transport — April',       branch_id: 3, recorded_by: 6,  date: '2026-04-13', notes: null },

  // ── Onitsha Branch (branch 4) ─────────────────────────────────────────────
  { amount: 200000, category: 'RENT',            description: 'Warehouse + shop rent — April',         branch_id: 4, recorded_by: 7, date: '2026-04-01', notes: null },
  { amount: 41000,  category: 'UTILITIES',       description: 'EEDC power bill — April',               branch_id: 4, recorded_by: 7, date: '2026-04-04', notes: null },
  { amount: 85000,  category: 'SALARIES',        description: 'Casual labour — loading/offloading',    branch_id: 4, recorded_by: 7, date: '2026-04-10', notes: 'Contract workers for April' },
  { amount: 56000,  category: 'WAYBILLFEES',     description: 'Interstate waybill & dispatch fees',    branch_id: 4, recorded_by: 9, date: '2026-04-12', notes: null },
  { amount: 19000,  category: 'MAINTENANCE',     description: 'Forklift maintenance',                  branch_id: 4, recorded_by: 7, date: '2026-04-15', notes: null },
  { amount: 11500,  category: 'MISCELLANEOUS',   description: 'Safety equipment (gloves, vests)',      branch_id: 4, recorded_by: 9, date: '2026-04-17', notes: null },
  { amount: 12000,  category: 'FEEDING',         description: 'Warehouse team feeding — April',        branch_id: 4, recorded_by: 9, date: '2026-04-17', notes: null },
  { amount: 18000,  category: 'DAILY_TRANSPORT', description: 'Staff & goods transport — April',       branch_id: 4, recorded_by: 7, date: '2026-04-18', notes: null },

  // ── March entries for chart variety ──────────────────────────────────────
  { amount: 350000, category: 'RENT',            description: 'Office rent — March 2026',              branch_id: 1, recorded_by: 1,  date: '2026-03-01', notes: null },
  { amount: 280000, category: 'RENT',            description: 'Shop rent — March 2026',                branch_id: 2, recorded_by: 5,  date: '2026-03-01', notes: null },
  { amount: 320000, category: 'RENT',            description: 'Premises rent — March 2026',            branch_id: 3, recorded_by: 10, date: '2026-03-01', notes: null },
  { amount: 200000, category: 'RENT',            description: 'Warehouse rent — March 2026',           branch_id: 4, recorded_by: 7,  date: '2026-03-01', notes: null },
  { amount: 60000,  category: 'UTILITIES',       description: 'Utilities bundle — March',              branch_id: 1, recorded_by: 2,  date: '2026-03-05', notes: null },
  { amount: 38000,  category: 'WAYBILLFEES',     description: 'March waybill fees — all carriers',     branch_id: 2, recorded_by: 5,  date: '2026-03-15', notes: null },
  { amount: 120000, category: 'SALARIES',        description: 'March support staff salaries',          branch_id: 1, recorded_by: 1,  date: '2026-03-28', notes: null },
  { amount: 22000,  category: 'FEEDING',         description: 'March staff feeding — all branches',    branch_id: 3, recorded_by: 6,  date: '2026-03-20', notes: null },
  { amount: 19000,  category: 'DAILY_TRANSPORT', description: 'March transport allowances',            branch_id: 4, recorded_by: 7,  date: '2026-03-25', notes: null },
];

async function seed() {
  await client.connect();
  console.log('Connected. Seeding expenses…');

  let inserted = 0;
  for (const e of expenses) {
    await client.query(
      `INSERT INTO expenses (amount, category, description, branch_id, recorded_by, date, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [e.amount, e.category, e.description, e.branch_id, e.recorded_by, e.date, e.notes]
    );
    inserted++;
  }

  console.log(`✓ Inserted ${inserted} expenses`);
  await client.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
