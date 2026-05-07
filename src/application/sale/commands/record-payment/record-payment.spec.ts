import { NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import RecordSalePaymentHandler from './record-payment';
import RecordSalePaymentCommand from './record-payment.command';
import Sale from 'src/domain/sale/sale';
import SalePayment from 'src/domain/sale/sale-payment';
import SaleStatus from 'src/domain/sale/sale-status';
import PaymentStatus from 'src/domain/sale/payment-status';
import PaymentMethod from 'src/domain/sale/payment-method';
import SaleRepository from 'src/infrastructure/database/repositories/sale/sale.repository';
import SalePaymentRepository from 'src/infrastructure/database/repositories/sale/sale-payment.repository';

describe('RecordSalePaymentHandler', () => {
  let handler: RecordSalePaymentHandler;
  let saleRepo: jest.Mocked<SaleRepository>;
  let paymentRepo: jest.Mocked<SalePaymentRepository>;
  let eventBus: jest.Mocked<EventBus>;

  const buildSale = (total = 100_000) =>
    new Sale(
      1,
      'SALE-2026-001',
      10,
      4,
      1,
      SaleStatus.DRAFT,
      PaymentStatus.PENDING,
      PaymentMethod.CASH,
      total,
      0,
      total,
      null,
      new Date(),
      new Date(),
      new Date(),
      null,
      [],
      [],
    );

  const buildPayment = (amount: number) =>
    new SalePayment(undefined, 1, amount, PaymentMethod.CASH, null, null, 4, new Date(), new Date(), new Date());

  beforeEach(() => {
    saleRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      commit: jest.fn(),
      delete: jest.fn(),
      toDomain: jest.fn(),
    } as unknown as jest.Mocked<SaleRepository>;
    paymentRepo = {
      findById: jest.fn(),
      findBySale: jest.fn(),
      commit: jest.fn(),
      delete: jest.fn(),
      toDomain: jest.fn(),
    } as unknown as jest.Mocked<SalePaymentRepository>;
    eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    handler = new RecordSalePaymentHandler(saleRepo, paymentRepo, eventBus);
  });

  it('marks sale as PAID once total payments meet or exceed the sale total', async () => {
    const sale = buildSale(100_000);
    saleRepo.findById.mockResolvedValue(sale);
    paymentRepo.commit.mockImplementation(async (p) => p);
    paymentRepo.findBySale.mockResolvedValue([buildPayment(100_000)]);
    saleRepo.commit.mockImplementation(async (s) => s);

    await handler.execute(new RecordSalePaymentCommand(1, 100_000, PaymentMethod.CASH, 4));

    expect(sale.getPaymentStatus()).toBe(PaymentStatus.PAID);
  });

  it('marks sale as PARTIAL when payments are below the sale total', async () => {
    const sale = buildSale(100_000);
    saleRepo.findById.mockResolvedValue(sale);
    paymentRepo.commit.mockImplementation(async (p) => p);
    paymentRepo.findBySale.mockResolvedValue([buildPayment(40_000)]);
    saleRepo.commit.mockImplementation(async (s) => s);

    await handler.execute(new RecordSalePaymentCommand(1, 40_000, PaymentMethod.CASH, 4));

    expect(sale.getPaymentStatus()).toBe(PaymentStatus.PARTIAL);
  });

  it('throws NotFoundException when the sale does not exist', async () => {
    saleRepo.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new RecordSalePaymentCommand(99, 5_000, PaymentMethod.CASH, 4)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
