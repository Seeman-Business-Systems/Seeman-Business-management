import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import InventoryAdjusted from 'src/domain/inventory/events/inventory-adjusted.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(InventoryAdjusted)
class OnInventoryAdjustedActivityHandler implements IEventHandler<InventoryAdjusted> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: InventoryAdjusted): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.INVENTORY_ADJUSTED,
      event.actorId,
      null,
      'InventoryBatch',
      event.batchId,
      null,
      null,
      event.warehouseId,
      {
        batchId: event.batchId,
        variantId: event.variantId,
        warehouseId: event.warehouseId,
        adjustmentQuantity: event.adjustmentQuantity,
        notes: event.notes,
      },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnInventoryAdjustedActivityHandler;
