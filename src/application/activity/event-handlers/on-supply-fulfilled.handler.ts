import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import SupplyFulfilled from 'src/domain/supply/events/supply-fulfilled.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(SupplyFulfilled)
class OnSupplyFulfilledActivityHandler implements IEventHandler<SupplyFulfilled> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: SupplyFulfilled): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.SUPPLY_FULFILLED,
      event.fulfilledBy,
      null,
      'Supply',
      event.supplyId,
      event.supplyNumber,
      event.branchId,
      null,
      {
        supplyNumber: event.supplyNumber,
        saleId: event.saleId,
      },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnSupplyFulfilledActivityHandler;
