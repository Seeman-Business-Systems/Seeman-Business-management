import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import SupplyCreated from 'src/domain/supply/events/supply-created.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(SupplyCreated)
class OnSupplyCreatedActivityHandler implements IEventHandler<SupplyCreated> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: SupplyCreated): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.SUPPLY_CREATED,
      0, // system-generated — no human actor
      null,
      'Supply',
      event.supplyId,
      event.supplyNumber,
      event.branchId,
      null,
      {
        supplyNumber: event.supplyNumber,
        saleId: event.saleId,
        itemCount: event.itemCount,
      },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnSupplyCreatedActivityHandler;
