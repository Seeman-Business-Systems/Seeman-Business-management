import { NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import CancelSaleHandler from './cancel-sale';
import CancelSaleCommand from './cancel-sale.command';
import Sale from 'src/domain/sale/sale';
import SaleStatus from 'src/domain/sale/sale-status';
import PaymentStatus from 'src/domain/sale/payment-status';
import PaymentMethod from 'src/domain/sale/payment-method';
import SaleCancelled from 'src/domain/sale/events/sale-cancelled.event';
import SaleRepository from 'src/infrastructure/database/repositories/sale/sale.repository';

describe('CancelSaleHandler', () => {
  let handler: CancelSaleHandler;
  let saleRepo: jest.Mocked<SaleRepository>;
  let eventBus: jest.Mocked<EventBus>;

  const buildSale = () =>
    new Sale(
      1,
      'SALE-2026-001',
      10,
      4,
      1,
      SaleStatus.DRAFT,
      PaymentStatus.PENDING,
      PaymentMethod.CASH,
      100_000,
      0,
      100_000,
      null,
      new Date(),
      new Date(),
      new Date(),
      null,
      [],
      [],
    );

  beforeEach(() => {
    saleRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      commit: jest.fn(),
      delete: jest.fn(),
      toDomain: jest.fn(),
    } as unknown as jest.Mocked<SaleRepository>;
    eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    handler = new CancelSaleHandler(saleRepo, eventBus);
  });

  it('transitions the sale to CANCELLED and emits SaleCancelled', async () => {
    const sale = buildSale();
    saleRepo.findById.mockResolvedValue(sale);
    saleRepo.commit.mockImplementation(async (s) => s);

    const result = await handler.execute(new CancelSaleCommand(1, 4));

    expect(result.getStatus()).toBe(SaleStatus.CANCELLED);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(SaleCancelled));
  });

  it('throws NotFoundException when the sale does not exist', async () => {
    saleRepo.findById.mockResolvedValue(null);

    await expect(handler.execute(new CancelSaleCommand(99, 4))).rejects.toBeInstanceOf(NotFoundException);
  });
});
