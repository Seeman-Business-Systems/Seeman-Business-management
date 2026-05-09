import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import RecordSalePaymentHandler from '../src/application/sale/commands/record-payment/record-payment';
import RecordSalePaymentCommand from '../src/application/sale/commands/record-payment/record-payment.command';
import SaleRepository from '../src/infrastructure/database/repositories/sale/sale.repository';
import SalePaymentRepository from '../src/infrastructure/database/repositories/sale/sale-payment.repository';
import Sale from '../src/domain/sale/sale';
import SalePayment from '../src/domain/sale/sale-payment';
import SaleStatus from '../src/domain/sale/sale-status';
import PaymentStatus from '../src/domain/sale/payment-status';
import PaymentMethod from '../src/domain/sale/payment-method';
import PaymentRecorded from '../src/domain/sale/events/payment-recorded.event';

describe('Record Sale Payment (integration)', () => {
  let module: TestingModule;
  let commandBus: CommandBus;
  let eventBus: EventBus;
  let saleRepo: jest.Mocked<SaleRepository>;
  let paymentRepo: jest.Mocked<SalePaymentRepository>;
  let publishedEvents: IEvent[];

  const buildSale = (total: number, paymentStatus = PaymentStatus.PENDING) =>
    new Sale(
      1,
      'SALE-2026-001',
      10,
      4,
      1,
      SaleStatus.DRAFT,
      paymentStatus,
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

  beforeEach(async () => {
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

    module = await Test.createTestingModule({
      imports: [CqrsModule.forRoot()],
      providers: [
        RecordSalePaymentHandler,
        { provide: SaleRepository, useValue: saleRepo },
        { provide: SalePaymentRepository, useValue: paymentRepo },
      ],
    }).compile();

    await module.init();

    commandBus = module.get(CommandBus);
    eventBus = module.get(EventBus);

    publishedEvents = [];
    eventBus.subscribe((event) => publishedEvents.push(event));
  });

  afterEach(async () => {
    await module.close();
  });

  it('full payment routes through CommandBus, marks sale PAID, and publishes PaymentRecorded', async () => {
    const sale = buildSale(150_000);
    saleRepo.findById.mockResolvedValue(sale);
    paymentRepo.commit.mockImplementation(async (p) => p);
    paymentRepo.findBySale.mockResolvedValue([buildPayment(150_000)]);
    saleRepo.commit.mockImplementation(async (s) => s);

    const result = await commandBus.execute(
      new RecordSalePaymentCommand(1, 150_000, PaymentMethod.CASH, 4, 'TXN-001', 'Final settlement'),
    );

    expect(result.getAmount()).toBe(150_000);
    expect(sale.getPaymentStatus()).toBe(PaymentStatus.PAID);
    expect(saleRepo.commit).toHaveBeenCalledTimes(1);

    await new Promise((resolve) => setImmediate(resolve));
    const event = publishedEvents.find((e): e is PaymentRecorded => e instanceof PaymentRecorded);
    expect(event).toBeDefined();
    expect(event!.saleId).toBe(1);
    expect(event!.amount).toBe(150_000);
    expect(event!.recordedBy).toBe(4);
  });

  it('partial payment marks sale PARTIAL when cumulative payments are below the total', async () => {
    const sale = buildSale(150_000);
    saleRepo.findById.mockResolvedValue(sale);
    paymentRepo.commit.mockImplementation(async (p) => p);
    paymentRepo.findBySale.mockResolvedValue([buildPayment(50_000)]);
    saleRepo.commit.mockImplementation(async (s) => s);

    await commandBus.execute(
      new RecordSalePaymentCommand(1, 50_000, PaymentMethod.CASH, 4),
    );

    expect(sale.getPaymentStatus()).toBe(PaymentStatus.PARTIAL);
  });

  it('aggregates multiple historical payments to compute the final status', async () => {
    const sale = buildSale(100_000, PaymentStatus.PARTIAL);
    saleRepo.findById.mockResolvedValue(sale);
    paymentRepo.commit.mockImplementation(async (p) => p);
    paymentRepo.findBySale.mockResolvedValue([
      buildPayment(40_000),
      buildPayment(35_000),
      buildPayment(25_000),
    ]);
    saleRepo.commit.mockImplementation(async (s) => s);

    await commandBus.execute(
      new RecordSalePaymentCommand(1, 25_000, PaymentMethod.BANK_TRANSFER, 4),
    );

    expect(sale.getPaymentStatus()).toBe(PaymentStatus.PAID);
  });

  it('returns NotFoundException when the sale id does not exist', async () => {
    saleRepo.findById.mockResolvedValue(null);

    await expect(
      commandBus.execute(new RecordSalePaymentCommand(999, 5_000, PaymentMethod.CASH, 4)),
    ).rejects.toBeInstanceOf(NotFoundException);

    await new Promise((resolve) => setImmediate(resolve));
    expect(publishedEvents).toHaveLength(0);
    expect(paymentRepo.commit).not.toHaveBeenCalled();
  });
});
