import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import SaleCreated from 'src/domain/sale/events/sale-created.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(SaleCreated)
class OnSaleCreatedActivityHandler implements IEventHandler<SaleCreated> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: SaleCreated): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.SALE_CREATED,
      event.soldBy,
      null,
      'Sale',
      event.saleId,
      event.saleNumber,
      event.branchId,
      null,
      {
        saleNumber: event.saleNumber,
        totalAmount: event.totalAmount,
        itemCount: event.lineItems.length,
        items: event.lineItems.map((i) => ({
          variantId: i.variantId,
          variantName: i.variantName ?? null,
          quantity: i.quantity,
        })),
        customerId: event.customerId,
      },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnSaleCreatedActivityHandler;
