import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import ProductCreated from 'src/domain/product/events/product-created.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(ProductCreated)
class OnProductCreatedActivityHandler implements IEventHandler<ProductCreated> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: ProductCreated): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.PRODUCT_CREATED,
      event.createdBy,
      null,
      'Product',
      event.productId,
      event.name,
      null,
      null,
      { productId: event.productId, name: event.name },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnProductCreatedActivityHandler;
