import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import InventoryTransferred from 'src/domain/inventory/events/inventory-transferred.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(InventoryTransferred)
class OnInventoryTransferredActivityHandler implements IEventHandler<InventoryTransferred> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: InventoryTransferred): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.INVENTORY_TRANSFERRED,
      event.actorId,
      null,
      'InventoryBatch',
      event.batchId,
      null,
      null,
      event.fromWarehouseId,
      {
        batchId: event.batchId,
        variantId: event.variantId,
        fromWarehouseId: event.fromWarehouseId,
        toWarehouseId: event.toWarehouseId,
        quantity: event.quantity,
      },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnInventoryTransferredActivityHandler;
