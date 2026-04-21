import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import CancelSaleCommand from './cancel-sale.command';
import Sale from 'src/domain/sale/sale';
import SaleStatus from 'src/domain/sale/sale-status';
import SaleRepository from 'src/infrastructure/database/repositories/sale/sale.repository';
import SaleCancelled from 'src/domain/sale/events/sale-cancelled.event';

@CommandHandler(CancelSaleCommand)
class CancelSaleHandler implements ICommandHandler<CancelSaleCommand> {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelSaleCommand): Promise<Sale> {
    const sale = await this.saleRepository.findById(command.saleId);

    if (!sale) {
      throw new NotFoundException(`Sale with id ${command.saleId} not found`);
    }

    sale.setStatus(SaleStatus.CANCELLED);

    const cancelled = await this.saleRepository.commit(sale);

    this.eventBus.publish(
      new SaleCancelled(
        cancelled.getId()!,
        cancelled.getSaleNumber(),
        cancelled.getBranchId(),
        command.cancelledBy,
        cancelled.getTotalAmount(),
      ),
    );

    return cancelled;
  }
}

export default CancelSaleHandler;
