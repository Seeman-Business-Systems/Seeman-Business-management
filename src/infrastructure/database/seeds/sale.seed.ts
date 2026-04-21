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

// Staff IDs:  1=Paschal(br1), 2=Chidinma(br1), 3=Ikenna(br1), 4=Olisa(br1)
//             5=Ozara(br2), 6=Otinuy(br3), 7=Paul(br4), 8=Chisom(br2)
// Customer IDs: 2=Nzube, 3=Odia, 5=Chukwuemeka, 6=Amaka, 7=Oluwaseun, 8=Fatima
// Branch IDs: 1=Head Office (Onitsha), 2=Lagos Island, 3=Abuja, 4=Onitsha Main Market
// Variant IDs:
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

    const salesData: Array<{
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
      lineItems: Array<{
        variantId: number;
        quantity: number;
        unitPrice: number;
        discountAmount: number;
      }>;
      payments: Array<{
        amount: number;
        paymentMethod: PaymentMethod;
        reference: string | null;
        notes: string | null;
        recordedBy: number;
        recordedAt: Date;
      }>;
    }> = [
      // SAL-2026-03-01-001 — walk-in, 2 tyres, fully paid cash
      {
        saleNumber: 'SAL-2026-03-01-001',
        customerId: null,
        soldBy: 2,
        branchId: 1,
        status: SaleStatus.FULFILLED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        discountAmount: 0,
        notes: null,
        soldAt: new Date('2026-03-01T09:15:00'),
        lineItems: [
          { variantId: 1, quantity: 2, unitPrice: 45000, discountAmount: 0 },
        ],
        payments: [
          {
            amount: 90000,
            paymentMethod: PaymentMethod.CASH,
            reference: null,
            notes: null,
            recordedBy: 2,
            recordedAt: new Date('2026-03-01T09:15:00'),
          },
        ],
      },
      // SAL-2026-03-01-002 — Chukwuemeka Okonkwo Trading, Keke tyres + battery, transfer
      {
        saleNumber: 'SAL-2026-03-01-002',
        customerId: 5,
        soldBy: 2,
        branchId: 1,
        status: SaleStatus.FULFILLED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.TRANSFER,
        discountAmount: 0,
        notes: 'Regular customer — Okonkwo Trading',
        soldAt: new Date('2026-03-01T11:30:00'),
        lineItems: [
          { variantId: 17, quantity: 4, unitPrice: 11500, discountAmount: 0 },
          { variantId: 23, quantity: 1, unitPrice: 32000, discountAmount: 0 },
        ],
        payments: [
          {
            amount: 78000,
            paymentMethod: PaymentMethod.TRANSFER,
            reference: 'TRF-20260301-ABC123',
            notes: null,
            recordedBy: 2,
            recordedAt: new Date('2026-03-01T11:35:00'),
          },
        ],
      },
      // SAL-2026-03-05-001 — walk-in Lagos, Michelin tyres, partial payment
      {
        saleNumber: 'SAL-2026-03-05-001',
        customerId: null,
        soldBy: 5,
        branchId: 2,
        status: SaleStatus.FULFILLED,
        paymentStatus: PaymentStatus.PARTIAL,
        paymentMethod: PaymentMethod.CREDIT,
        discountAmount: 0,
        notes: 'Customer paid half upfront, balance to follow',
        soldAt: new Date('2026-03-05T14:00:00'),
        lineItems: [
          { variantId: 9, quantity: 4, unitPrice: 68000, discountAmount: 0 },
        ],
        payments: [
          {
            amount: 136000,
            paymentMethod: PaymentMethod.CASH,
            reference: null,
            notes: 'Initial deposit',
            recordedBy: 5,
            recordedAt: new Date('2026-03-05T14:00:00'),
          },
        ],
      },
      // SAL-2026-03-07-001 — Nzube Ozor, bulk Austone tricycle tyres, discount given
      {
        saleNumber: 'SAL-2026-03-07-001',
        customerId: 2,
        soldBy: 2,
        branchId: 1,
        status: SaleStatus.FULFILLED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        discountAmount: 5000,
        notes: 'Bulk order discount applied',
        soldAt: new Date('2026-03-07T10:45:00'),
        lineItems: [
          { variantId: 15, quantity: 8, unitPrice: 12500, discountAmount: 0 },
          { variantId: 17, quantity: 8, unitPrice: 11500, discountAmount: 0 },
        ],
        payments: [
          {
            amount: 187000,
            paymentMethod: PaymentMethod.CASH,
            reference: null,
            notes: null,
            recordedBy: 2,
            recordedAt: new Date('2026-03-07T10:45:00'),
          },
        ],
      },
      // SAL-2026-03-10-001 — Abuja branch, Varta battery, card payment
      {
        saleNumber: 'SAL-2026-03-10-001',
        customerId: 3,
        soldBy: 6,
        branchId: 3,
        status: SaleStatus.FULFILLED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.CARD,
        discountAmount: 0,
        notes: null,
        soldAt: new Date('2026-03-10T16:20:00'),
        lineItems: [
          { variantId: 26, quantity: 2, unitPrice: 68000, discountAmount: 0 },
        ],
        payments: [
          {
            amount: 136000,
            paymentMethod: PaymentMethod.CARD,
            reference: 'POS-20260310-00234',
            notes: null,
            recordedBy: 6,
            recordedAt: new Date('2026-03-10T16:22:00'),
          },
        ],
      },
      // SAL-2026-03-12-001 — Fatima Ibrahim & Sons, mixed sale, outstanding balance
      {
        saleNumber: 'SAL-2026-03-12-001',
        customerId: 8,
        soldBy: 2,
        branchId: 1,
        status: SaleStatus.FULFILLED,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CREDIT,
        discountAmount: 0,
        notes: 'Ibrahim & Sons — 30-day credit terms',
        soldAt: new Date('2026-03-12T09:00:00'),
        lineItems: [
          { variantId: 4, quantity: 4, unitPrice: 18000, discountAmount: 0 },
          { variantId: 24, quantity: 2, unitPrice: 40000, discountAmount: 0 },
        ],
        payments: [],
      },
      // SAL-2026-03-14-001 — cancelled sale, Lagos
      {
        saleNumber: 'SAL-2026-03-14-001',
        customerId: null,
        soldBy: 5,
        branchId: 2,
        status: SaleStatus.CANCELLED,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CASH,
        discountAmount: 0,
        notes: 'Customer changed mind before payment',
        soldAt: new Date('2026-03-14T13:00:00'),
        lineItems: [
          { variantId: 28, quantity: 1, unitPrice: 62000, discountAmount: 0 },
        ],
        payments: [],
      },
      // SAL-2026-03-15-001 — Amaka Nwosu, tyres + battery, fully paid transfer
      {
        saleNumber: 'SAL-2026-03-15-001',
        customerId: 6,
        soldBy: 2,
        branchId: 1,
        status: SaleStatus.FULFILLED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.TRANSFER,
        discountAmount: 2000,
        notes: null,
        soldAt: new Date('2026-03-15T11:00:00'),
        lineItems: [
          { variantId: 1, quantity: 2, unitPrice: 45000, discountAmount: 0 },
          { variantId: 25, quantity: 1, unitPrice: 52000, discountAmount: 0 },
        ],
        payments: [
          {
            amount: 140000,
            paymentMethod: PaymentMethod.TRANSFER,
            reference: 'TRF-20260315-XY9090',
            notes: null,
            recordedBy: 2,
            recordedAt: new Date('2026-03-15T11:05:00'),
          },
        ],
      },
    ];

    let created = 0;

    for (const saleData of salesData) {
      // Calculate subtotal from line items
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

      // Create line items
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

      // Create payments
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
