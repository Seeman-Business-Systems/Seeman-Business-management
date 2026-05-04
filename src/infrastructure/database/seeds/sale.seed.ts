import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import SaleRepository from '../repositories/sale/sale.repository';
import SaleLineItemRepository from '../repositories/sale/sale-line-item.repository';
import SalePaymentRepository from '../repositories/sale/sale-payment.repository';
import SaleEntity from '../entities/sale.entity';
import Sale from 'src/domain/sale/sale';
import SaleLineItem from 'src/domain/sale/sale-line-item';
import SalePayment from 'src/domain/sale/sale-payment';
import SaleStatus from 'src/domain/sale/sale-status';
import PaymentStatus from 'src/domain/sale/payment-status';
import PaymentMethod from 'src/domain/sale/payment-method';

// Staff IDs (from staff seed):
//   B1: 1=Paschal(SA), 2=Sunday(CEO), 3=manager, 4=sales, 5-7=apprentices
//   B2: 8=manager, 9=sales, 10-11=apprentices
//   B4: 12=manager, 13=sales, 14-15=apprentices
// (Branch 3 / Abuja has no staff so no sales seeded there.)
//
// Customer IDs (from customer seed, 15 per branch):
//   B1: 1-15, B2: 16-30, B4: 31-45
//
// Variant IDs (from product-variant seed):
//   1=Bridgestone Turanza 195/65 R15 (₦45,000)
//   4=Presa PS01 175/70 R13 (₦18,000)
//   9=Michelin Primacy 4 205/55 R16 (₦68,000)
//   15=Austone Tricycle 4.00-8 (₦12,500)
//   17=Hifly Keke NAPEP 4.00-8 (₦11,500)
//   23=Seeman Standard NS40 (₦32,000)
//   24=Seeman Standard NS60 (₦40,000)
//   25=Seeman Standard N70 (₦52,000)
//   26=Varta Blue Dynamic E11 (₦68,000)
//   28=Bosch S4 005 (₦62,000)

type SeedLineItem = {
  variantId: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
};

type SeedPayment = {
  amount: number;
  paymentMethod: PaymentMethod;
  reference: string | null;
  notes: string | null;
  recordedBy: number;
  recordedAt: Date;
};

type SeedSale = {
  saleNumber: string;
  customerId: number | null;
  soldBy: number;
  branchId: number;
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  discountAmount: number;
  notes: string | null;
  soldAt: Date;
  lineItems: SeedLineItem[];
  payments: SeedPayment[];
};

const ymd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const buildSale = (params: {
  branchId: number;
  branchPrefix: string;
  index: number;
  customerId: number | null;
  soldBy: number;
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  soldAt: Date;
  lineItems: SeedLineItem[];
  discountAmount?: number;
  partialAmount?: number; // for PARTIAL status — amount actually paid
  notes?: string | null;
  paymentReference?: string | null;
}): SeedSale => {
  const subtotal = params.lineItems.reduce(
    (s, li) => s + li.quantity * li.unitPrice - li.discountAmount,
    0,
  );
  const discountAmount = params.discountAmount ?? 0;
  const totalAmount = subtotal - discountAmount;
  const saleNumber = `SAL-${ymd(params.soldAt)}-${params.branchPrefix}-${String(params.index).padStart(3, '0')}`;

  let payments: SeedPayment[] = [];
  if (params.status !== SaleStatus.CANCELLED) {
    if (params.paymentStatus === PaymentStatus.PAID) {
      payments = [
        {
          amount: totalAmount,
          paymentMethod: params.paymentMethod,
          reference: params.paymentReference ?? null,
          notes: null,
          recordedBy: params.soldBy,
          recordedAt: params.soldAt,
        },
      ];
    } else if (params.paymentStatus === PaymentStatus.PARTIAL) {
      payments = [
        {
          amount: params.partialAmount ?? Math.floor(totalAmount / 2),
          paymentMethod: PaymentMethod.CASH,
          reference: null,
          notes: 'Initial deposit',
          recordedBy: params.soldBy,
          recordedAt: params.soldAt,
        },
      ];
    }
  }

  return {
    saleNumber,
    customerId: params.customerId,
    soldBy: params.soldBy,
    branchId: params.branchId,
    status: params.status,
    paymentStatus: params.paymentStatus,
    paymentMethod: params.paymentMethod,
    discountAmount,
    notes: params.notes ?? null,
    soldAt: params.soldAt,
    lineItems: params.lineItems,
    payments,
  };
};

const day = (year: number, month: number, dayOfMonth: number, hour = 10, minute = 0): Date =>
  new Date(year, month - 1, dayOfMonth, hour, minute);

// Recurring product mixes used across branches.
const tyrePair = (variantId: number, unitPrice: number, qty = 2): SeedLineItem[] => [
  { variantId, quantity: qty, unitPrice, discountAmount: 0 },
];

const tyreSet = (variantId: number, unitPrice: number): SeedLineItem[] => [
  { variantId, quantity: 4, unitPrice, discountAmount: 0 },
];

const battery = (variantId: number, unitPrice: number, qty = 1): SeedLineItem[] => [
  { variantId, quantity: qty, unitPrice, discountAmount: 0 },
];

const tyresAndBattery = (
  tyreVariant: number,
  tyrePrice: number,
  batteryVariant: number,
  batteryPrice: number,
): SeedLineItem[] => [
  { variantId: tyreVariant, quantity: 2, unitPrice: tyrePrice, discountAmount: 0 },
  { variantId: batteryVariant, quantity: 1, unitPrice: batteryPrice, discountAmount: 0 },
];

const branch1Sales: SeedSale[] = [
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 1, customerId: null, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 1, 9, 15), lineItems: tyrePair(1, 45000) }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 2, customerId: 1, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 1, 11, 30), lineItems: [{ variantId: 17, quantity: 4, unitPrice: 11500, discountAmount: 0 }, { variantId: 23, quantity: 1, unitPrice: 32000, discountAmount: 0 }], notes: 'Okonkwo Trading bulk order', paymentReference: 'TRF-20260301-OK001' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 3, customerId: 3, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 2, 10, 45), lineItems: [{ variantId: 15, quantity: 8, unitPrice: 12500, discountAmount: 0 }, { variantId: 17, quantity: 8, unitPrice: 11500, discountAmount: 0 }], discountAmount: 5000, notes: 'Bulk Keke discount' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 4, customerId: 5, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 3, 11), lineItems: tyresAndBattery(1, 45000, 25, 52000), discountAmount: 2000, paymentReference: 'TRF-20260303-CK002' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 5, customerId: null, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 4, 14), lineItems: tyrePair(4, 18000) }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 6, customerId: 6, soldBy: 3, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PENDING, paymentMethod: PaymentMethod.CREDIT, soldAt: day(2026, 3, 5, 9), lineItems: [{ variantId: 4, quantity: 4, unitPrice: 18000, discountAmount: 0 }, { variantId: 24, quantity: 2, unitPrice: 40000, discountAmount: 0 }], notes: '30-day credit' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 7, customerId: 8, soldBy: 3, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 6, 12), lineItems: tyreSet(9, 68000), paymentReference: 'TRF-20260306-KE003' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 8, customerId: null, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CARD, soldAt: day(2026, 3, 7, 13, 30), lineItems: battery(26, 68000, 1), paymentReference: 'POS-20260307-00112' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 9, customerId: 11, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 8, 10), lineItems: [{ variantId: 23, quantity: 2, unitPrice: 32000, discountAmount: 0 }] }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 10, customerId: 13, soldBy: 3, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PARTIAL, paymentMethod: PaymentMethod.CREDIT, soldAt: day(2026, 3, 9, 15), lineItems: tyreSet(1, 45000), partialAmount: 100000, notes: 'Balance pending' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 11, customerId: null, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 10, 9), lineItems: tyrePair(15, 12500, 4) }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 12, customerId: 2, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 11, 11), lineItems: tyrePair(1, 45000), paymentReference: 'TRF-20260311-AM004' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 13, customerId: null, soldBy: 4, status: SaleStatus.CANCELLED, paymentStatus: PaymentStatus.PENDING, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 12, 14), lineItems: battery(28, 62000), notes: 'Customer changed mind' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 14, customerId: 14, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 13, 10, 30), lineItems: tyrePair(4, 18000) }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 15, customerId: 7, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 14, 12), lineItems: [{ variantId: 24, quantity: 1, unitPrice: 40000, discountAmount: 0 }] }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 16, customerId: 9, soldBy: 3, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PENDING, paymentMethod: PaymentMethod.CREDIT, soldAt: day(2026, 3, 15, 9, 30), lineItems: [{ variantId: 25, quantity: 4, unitPrice: 52000, discountAmount: 0 }], notes: 'Iwu Transport — credit' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 17, customerId: null, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 16, 11), lineItems: tyrePair(9, 68000) }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 18, customerId: 4, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 17, 13), lineItems: tyrePair(17, 11500, 4), paymentReference: 'TRF-20260317-OD005' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 19, customerId: 12, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 18, 10), lineItems: battery(23, 32000) }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 20, customerId: 15, soldBy: 3, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PARTIAL, paymentMethod: PaymentMethod.CREDIT, soldAt: day(2026, 3, 19, 14), lineItems: [{ variantId: 1, quantity: 4, unitPrice: 45000, discountAmount: 0 }, { variantId: 24, quantity: 2, unitPrice: 40000, discountAmount: 0 }], partialAmount: 130000, notes: 'Agbo Tyres — instalment' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 21, customerId: null, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CARD, soldAt: day(2026, 3, 20, 12), lineItems: tyrePair(15, 12500, 6), paymentReference: 'POS-20260320-00231' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 22, customerId: 10, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 21, 10), lineItems: tyrePair(4, 18000) }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 23, customerId: null, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 22, 15), lineItems: battery(28, 62000) }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 24, customerId: 1, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 23, 9, 30), lineItems: [{ variantId: 17, quantity: 6, unitPrice: 11500, discountAmount: 0 }], paymentReference: 'TRF-20260323-OK006' }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 25, customerId: null, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 24, 11), lineItems: tyrePair(1, 45000) }),
  buildSale({ branchId: 1, branchPrefix: 'HEA', index: 26, customerId: 6, soldBy: 4, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 25, 13), lineItems: [{ variantId: 25, quantity: 1, unitPrice: 52000, discountAmount: 0 }] }),
];

const branch2Sales: SeedSale[] = [
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 1, customerId: null, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 1, 10), lineItems: tyrePair(9, 68000) }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 2, customerId: 16, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 2, 11), lineItems: tyreSet(1, 45000), paymentReference: 'TRF-20260302-AD007' }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 3, customerId: null, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PARTIAL, paymentMethod: PaymentMethod.CREDIT, soldAt: day(2026, 3, 3, 14), lineItems: tyreSet(9, 68000), partialAmount: 136000, notes: 'Half upfront, balance to follow' }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 4, customerId: 18, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CARD, soldAt: day(2026, 3, 4, 12), lineItems: battery(26, 68000), paymentReference: 'POS-20260304-00099' }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 5, customerId: null, soldBy: 9, status: SaleStatus.CANCELLED, paymentStatus: PaymentStatus.PENDING, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 5, 13), lineItems: battery(28, 62000), notes: 'Customer changed mind' }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 6, customerId: 17, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 6, 10, 30), lineItems: tyrePair(1, 45000) }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 7, customerId: 20, soldBy: 8, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PENDING, paymentMethod: PaymentMethod.CREDIT, soldAt: day(2026, 3, 7, 9), lineItems: [{ variantId: 25, quantity: 4, unitPrice: 52000, discountAmount: 0 }], notes: 'Salami Logistics — credit' }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 8, customerId: 22, soldBy: 8, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 8, 11), lineItems: [{ variantId: 24, quantity: 2, unitPrice: 40000, discountAmount: 0 }, { variantId: 23, quantity: 1, unitPrice: 32000, discountAmount: 0 }], paymentReference: 'TRF-20260308-FN008' }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 9, customerId: null, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 9, 12), lineItems: tyrePair(4, 18000, 4) }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 10, customerId: 23, soldBy: 8, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 10, 14), lineItems: [{ variantId: 1, quantity: 4, unitPrice: 45000, discountAmount: 0 }], paymentReference: 'TRF-20260310-OW009' }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 11, customerId: 19, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 11, 10), lineItems: tyrePair(9, 68000) }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 12, customerId: 24, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CARD, soldAt: day(2026, 3, 12, 11, 30), lineItems: battery(26, 68000), paymentReference: 'POS-20260312-00104' }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 13, customerId: null, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 13, 13), lineItems: [{ variantId: 23, quantity: 2, unitPrice: 32000, discountAmount: 0 }] }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 14, customerId: 25, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 14, 9, 30), lineItems: tyrePair(1, 45000) }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 15, customerId: 26, soldBy: 8, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PARTIAL, paymentMethod: PaymentMethod.CREDIT, soldAt: day(2026, 3, 15, 10), lineItems: [{ variantId: 25, quantity: 2, unitPrice: 52000, discountAmount: 0 }, { variantId: 26, quantity: 1, unitPrice: 68000, discountAmount: 0 }], partialAmount: 80000 }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 16, customerId: null, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 16, 11), lineItems: tyrePair(4, 18000) }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 17, customerId: 27, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 17, 13), lineItems: [{ variantId: 9, quantity: 2, unitPrice: 68000, discountAmount: 0 }], paymentReference: 'TRF-20260317-IF010' }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 18, customerId: 28, soldBy: 8, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PENDING, paymentMethod: PaymentMethod.CREDIT, soldAt: day(2026, 3, 18, 14), lineItems: [{ variantId: 1, quantity: 6, unitPrice: 45000, discountAmount: 0 }], notes: 'Olatunde Spares — 30 day terms' }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 19, customerId: null, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 19, 10, 30), lineItems: battery(28, 62000) }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 20, customerId: 21, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 20, 12), lineItems: tyresAndBattery(9, 68000, 25, 52000) }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 21, customerId: 30, soldBy: 8, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 21, 11), lineItems: [{ variantId: 1, quantity: 4, unitPrice: 45000, discountAmount: 0 }], paymentReference: 'TRF-20260321-YS011' }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 22, customerId: null, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 22, 13), lineItems: tyrePair(15, 12500, 4) }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 23, customerId: 29, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CARD, soldAt: day(2026, 3, 23, 14), lineItems: battery(26, 68000), paymentReference: 'POS-20260323-00188' }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 24, customerId: null, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 24, 10), lineItems: tyrePair(4, 18000) }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 25, customerId: 16, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 25, 9, 30), lineItems: [{ variantId: 9, quantity: 2, unitPrice: 68000, discountAmount: 0 }] }),
  buildSale({ branchId: 2, branchPrefix: 'LAG', index: 26, customerId: 17, soldBy: 9, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 26, 11), lineItems: tyresAndBattery(1, 45000, 24, 40000), discountAmount: 1500, paymentReference: 'TRF-20260326-AR012' }),
];

const branch4Sales: SeedSale[] = [
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 1, customerId: 31, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PENDING, paymentMethod: PaymentMethod.CREDIT, soldAt: day(2026, 3, 1, 9), lineItems: [{ variantId: 4, quantity: 4, unitPrice: 18000, discountAmount: 0 }, { variantId: 24, quantity: 2, unitPrice: 40000, discountAmount: 0 }], notes: 'Ibrahim & Sons — 30-day credit' }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 2, customerId: null, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 2, 11), lineItems: tyrePair(1, 45000) }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 3, customerId: 32, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 3, 13), lineItems: tyreSet(9, 68000), paymentReference: 'TRF-20260303-RT013' }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 4, customerId: 33, soldBy: 12, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CARD, soldAt: day(2026, 3, 4, 14), lineItems: battery(26, 68000), paymentReference: 'POS-20260304-00077' }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 5, customerId: null, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 5, 10), lineItems: tyrePair(4, 18000) }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 6, customerId: 34, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 6, 11, 30), lineItems: [{ variantId: 23, quantity: 1, unitPrice: 32000, discountAmount: 0 }] }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 7, customerId: 35, soldBy: 12, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PARTIAL, paymentMethod: PaymentMethod.CREDIT, soldAt: day(2026, 3, 7, 9, 30), lineItems: [{ variantId: 25, quantity: 2, unitPrice: 52000, discountAmount: 0 }], partialAmount: 50000, notes: 'Akande Logistics partial' }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 8, customerId: null, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 8, 13), lineItems: tyrePair(15, 12500, 4) }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 9, customerId: 36, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 9, 12), lineItems: tyrePair(1, 45000) }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 10, customerId: 37, soldBy: 12, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 10, 11), lineItems: [{ variantId: 1, quantity: 4, unitPrice: 45000, discountAmount: 0 }, { variantId: 25, quantity: 1, unitPrice: 52000, discountAmount: 0 }], paymentReference: 'TRF-20260310-HK014' }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 11, customerId: null, soldBy: 13, status: SaleStatus.CANCELLED, paymentStatus: PaymentStatus.PENDING, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 11, 14), lineItems: battery(28, 62000), notes: 'Cancelled before payment' }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 12, customerId: 38, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 12, 10), lineItems: [{ variantId: 9, quantity: 2, unitPrice: 68000, discountAmount: 0 }] }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 13, customerId: 39, soldBy: 12, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 13, 11, 30), lineItems: tyresAndBattery(1, 45000, 24, 40000), paymentReference: 'TRF-20260313-BY015' }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 14, customerId: null, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 14, 13), lineItems: tyrePair(4, 18000) }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 15, customerId: 40, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CARD, soldAt: day(2026, 3, 15, 14), lineItems: battery(26, 68000), paymentReference: 'POS-20260315-00133' }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 16, customerId: 41, soldBy: 12, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PENDING, paymentMethod: PaymentMethod.CREDIT, soldAt: day(2026, 3, 16, 9, 30), lineItems: [{ variantId: 1, quantity: 6, unitPrice: 45000, discountAmount: 0 }], notes: 'Ojora Trading — credit' }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 17, customerId: null, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 17, 10), lineItems: tyrePair(9, 68000) }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 18, customerId: 42, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 18, 12), lineItems: tyrePair(15, 12500, 6) }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 19, customerId: 43, soldBy: 12, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 19, 11), lineItems: [{ variantId: 1, quantity: 4, unitPrice: 45000, discountAmount: 0 }, { variantId: 26, quantity: 1, unitPrice: 68000, discountAmount: 0 }], paymentReference: 'TRF-20260319-SD016' }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 20, customerId: null, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 20, 13), lineItems: battery(23, 32000) }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 21, customerId: 44, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 21, 10, 30), lineItems: tyrePair(1, 45000) }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 22, customerId: 45, soldBy: 12, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PARTIAL, paymentMethod: PaymentMethod.CREDIT, soldAt: day(2026, 3, 22, 14), lineItems: [{ variantId: 24, quantity: 3, unitPrice: 40000, discountAmount: 0 }], partialAmount: 60000 }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 23, customerId: null, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 23, 11), lineItems: tyrePair(4, 18000) }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 24, customerId: 31, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.TRANSFER, soldAt: day(2026, 3, 24, 12), lineItems: [{ variantId: 25, quantity: 2, unitPrice: 52000, discountAmount: 0 }], paymentReference: 'TRF-20260324-FT017' }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 25, customerId: null, soldBy: 13, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CARD, soldAt: day(2026, 3, 25, 13), lineItems: tyresAndBattery(9, 68000, 26, 68000), paymentReference: 'POS-20260325-00211' }),
  buildSale({ branchId: 4, branchPrefix: 'IKJ', index: 26, customerId: 33, soldBy: 12, status: SaleStatus.FULFILLED, paymentStatus: PaymentStatus.PAID, paymentMethod: PaymentMethod.CASH, soldAt: day(2026, 3, 26, 10), lineItems: tyrePair(1, 45000) }),
];

@Injectable()
export class SaleSeed {
  constructor(
    private readonly saleRepo: SaleRepository,
    private readonly lineItemRepo: SaleLineItemRepository,
    private readonly paymentRepo: SalePaymentRepository,
    @InjectRepository(SaleEntity)
    private readonly saleEntityRepo: Repository<SaleEntity>,
  ) {}

  async seed() {
    const count = await this.saleEntityRepo.count();

    if (count > 0) {
      console.log('Sales already exist. Skipping seed.');
      return;
    }

    const allSales: SeedSale[] = [
      ...branch1Sales,
      ...branch2Sales,
      ...branch4Sales,
    ];

    let created = 0;

    for (const saleData of allSales) {
      const subtotal = saleData.lineItems.reduce(
        (sum, item) =>
          sum + item.quantity * item.unitPrice - item.discountAmount,
        0,
      );
      const totalAmount = subtotal - saleData.discountAmount;

      const sale = new Sale(
        undefined,
        saleData.saleNumber,
        saleData.customerId,
        saleData.soldBy,
        saleData.branchId,
        saleData.status,
        saleData.paymentStatus,
        saleData.paymentMethod,
        subtotal,
        saleData.discountAmount,
        totalAmount,
        saleData.notes,
        saleData.soldAt,
        new Date(),
        new Date(),
        saleData.status === SaleStatus.CANCELLED ? new Date() : null,
        [],
        [],
      );

      const savedSale = await this.saleRepo.commit(sale);
      const saleId = savedSale.getId()!;

      for (const itemData of saleData.lineItems) {
        const lineTotal =
          itemData.quantity * itemData.unitPrice - itemData.discountAmount;
        const lineItem = new SaleLineItem(
          undefined,
          saleId,
          itemData.variantId,
          itemData.quantity,
          itemData.unitPrice,
          itemData.discountAmount,
          lineTotal,
          new Date(),
          new Date(),
        );
        await this.lineItemRepo.commit(lineItem);
      }

      for (const paymentData of saleData.payments) {
        const payment = new SalePayment(
          undefined,
          saleId,
          paymentData.amount,
          paymentData.paymentMethod,
          paymentData.reference,
          paymentData.notes,
          paymentData.recordedBy,
          paymentData.recordedAt,
          new Date(),
          new Date(),
        );
        await this.paymentRepo.commit(payment);
      }

      created++;
    }

    console.log(`✅ ${created} sales seeded successfully`);
  }
}
