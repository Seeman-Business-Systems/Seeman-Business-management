import { BadRequestException, NotFoundException } from '@nestjs/common';
import CancelSupplyHandler from './cancel-supply.handler';
import CancelSupplyCommand from './cancel-supply.command';
import Supply from 'src/domain/supply/supply';
import SupplyStatus from 'src/domain/supply/supply-status';
import SupplyRepository from 'src/infrastructure/database/repositories/supply/supply.repository';

describe('CancelSupplyHandler', () => {
  let handler: CancelSupplyHandler;
  let supplies: jest.Mocked<SupplyRepository>;

  const buildSupply = (status: SupplyStatus) =>
    new Supply(1, 'SUP-001', 10, 'SALE-001', 1, status, null, null, [], new Date(), new Date());

  beforeEach(() => {
    supplies = {
      findById: jest.fn(),
      findBySale: jest.fn(),
      commit: jest.fn(),
      toDomain: jest.fn(),
    } as unknown as jest.Mocked<SupplyRepository>;
    handler = new CancelSupplyHandler(supplies);
  });

  it('cancels a DRAFT supply', async () => {
    const supply = buildSupply(SupplyStatus.DRAFT);
    supplies.findById.mockResolvedValue(supply);
    supplies.commit.mockImplementation(async (s) => s);

    const result = await handler.execute(new CancelSupplyCommand(1, 4));

    expect(result.getStatus()).toBe(SupplyStatus.CANCELLED);
  });

  it('rejects cancelling a FULFILLED supply', async () => {
    supplies.findById.mockResolvedValue(buildSupply(SupplyStatus.FULFILLED));

    await expect(handler.execute(new CancelSupplyCommand(1, 4))).rejects.toBeInstanceOf(BadRequestException);
    expect(supplies.commit).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when supply is missing', async () => {
    supplies.findById.mockResolvedValue(null);

    await expect(handler.execute(new CancelSupplyCommand(99, 4))).rejects.toBeInstanceOf(NotFoundException);
  });
});
