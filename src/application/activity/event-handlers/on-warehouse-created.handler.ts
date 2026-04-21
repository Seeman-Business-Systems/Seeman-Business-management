import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import WarehouseCreated from 'src/domain/warehouse/events/warehouse-created.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(WarehouseCreated)
class OnWarehouseCreatedActivityHandler implements IEventHandler<WarehouseCreated> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: WarehouseCreated): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.WAREHOUSE_CREATED,
      event.createdBy,
      null,
      'Warehouse',
      event.warehouseId,
      event.name,
      event.branchId,
      event.warehouseId,
      { warehouseId: event.warehouseId, name: event.name, branchId: event.branchId },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnWarehouseCreatedActivityHandler;
