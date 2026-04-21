import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import SaleCancelled from 'src/domain/sale/events/sale-cancelled.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(SaleCancelled)
class OnSaleCancelledActivityHandler implements IEventHandler<SaleCancelled> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: SaleCancelled): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.SALE_CANCELLED,
      event.cancelledBy,
      null,
      'Sale',
      event.saleId,
      event.saleNumber,
      event.branchId,
      null,
      {
        saleNumber: event.saleNumber,
        totalAmount: event.totalAmount,
      },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnSaleCancelledActivityHandler;
