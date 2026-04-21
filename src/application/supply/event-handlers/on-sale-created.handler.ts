import { EventsHandler, IEventHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import SaleCreated from 'src/domain/sale/events/sale-created.event';
import Supply from 'src/domain/supply/supply';
import SupplyItem from 'src/domain/supply/supply-item';
import SupplyStatus from 'src/domain/supply/supply-status';
import SupplyCreated from 'src/domain/supply/events/supply-created.event';
import SupplyRepository from 'src/infrastructure/database/repositories/supply/supply.repository';
import SupplyItemRepository from 'src/infrastructure/database/repositories/supply/supply-item.repository';
import SupplyEntity from 'src/infrastructure/database/entities/supply.entity';

@EventsHandler(SaleCreated)
class OnSaleCreatedSupplyHandler implements IEventHandler<SaleCreated> {
  constructor(
    private readonly supplies: SupplyRepository,
    private readonly supplyItems: SupplyItemRepository,
    private readonly eventBus: EventBus,
    @InjectRepository(SupplyEntity)
    private readonly supplyEntityRepo: Repository<SupplyEntity>,
  ) {}

  async handle(event: SaleCreated): Promise<void> {
    const supplyNumber = await this.generateSupplyNumber();

    const supply = new Supply(
      undefined,
      supplyNumber,
      event.saleId,
      event.saleNumber,
      event.branchId,
      SupplyStatus.DRAFT,
      null,
      null,
      [],
      new Date(),
      new Date(),
    );

    const savedSupply = await this.supplies.commit(supply);

    const items = event.lineItems.map(
      (lineItem) =>
        new SupplyItem(
          undefined,
          savedSupply.getId()!,
          lineItem.variantId,
          lineItem.variantName ?? null,
          lineItem.quantity,
          new Date(),
        ),
    );

    const savedItems = await this.supplyItems.commitMany(items);
    savedSupply.setItems(savedItems);

    this.eventBus.publish(
      new SupplyCreated(
        savedSupply.getId()!,
        savedSupply.getSupplyNumber(),
        event.saleId,
        event.branchId,
        savedItems.length,
      ),
    );
  }

  private async generateSupplyNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `SUP-${year}-${month}-${day}`;

    const startOfDay = new Date(year, today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(year, today.getMonth(), today.getDate(), 23, 59, 59);

    const count = await this.supplyEntityRepo
      .createQueryBuilder('supply')
      .where('supply.createdAt >= :start AND supply.createdAt <= :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .getCount();

    const sequence = String(count + 1).padStart(3, '0');
    return `${datePrefix}-${sequence}`;
  }
}

export default OnSaleCreatedSupplyHandler;
