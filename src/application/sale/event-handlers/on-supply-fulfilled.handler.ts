import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import SupplyFulfilled from 'src/domain/supply/events/supply-fulfilled.event';
import SaleRepository from 'src/infrastructure/database/repositories/sale/sale.repository';
import SaleStatus from 'src/domain/sale/sale-status';

@EventsHandler(SupplyFulfilled)
class OnSupplyFulfilledHandler implements IEventHandler<SupplyFulfilled> {
  constructor(private readonly saleRepository: SaleRepository) {}

  async handle(event: SupplyFulfilled): Promise<void> {
    const sale = await this.saleRepository.findById(event.saleId);

    if (!sale || sale.getStatus() !== SaleStatus.DRAFT) return;

    sale.setStatus(SaleStatus.FULFILLED);
    await this.saleRepository.commit(sale);
  }
}

export default OnSupplyFulfilledHandler;
