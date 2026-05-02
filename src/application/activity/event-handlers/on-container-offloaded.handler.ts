import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import ContainerOffloaded from 'src/domain/inventory/events/container-offloaded.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(ContainerOffloaded)
class OnContainerOffloadedActivityHandler implements IEventHandler<ContainerOffloaded> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: ContainerOffloaded): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.CONTAINER_OFFLOADED,
      event.offloadedBy,
      null,
      'InventoryBatch',
      event.batchId,
      event.batchNumber,
      null,
      event.warehouseIds.length === 1 ? event.warehouseIds[0] : null,
      {
        batchNumber: event.batchNumber,
        itemCount: event.itemCount,
        totalUnits: event.totalUnits,
        warehouseIds: event.warehouseIds,
      },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnContainerOffloadedActivityHandler;
