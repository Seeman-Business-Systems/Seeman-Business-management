import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import StockAdded from 'src/domain/inventory/events/stock-added.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(StockAdded)
class OnStockAddedActivityHandler implements IEventHandler<StockAdded> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: StockAdded): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.STOCK_ADDED,
      event.actorId,
      null,
      'Inventory',
      event.inventoryId,
      null,
      null,
      event.warehouseId,
      {
        inventoryId: event.inventoryId,
        variantId: event.variantId,
        warehouseId: event.warehouseId,
        quantity: event.quantity,
        notes: event.notes,
      },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnStockAddedActivityHandler;
