import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import CustomerCreated from 'src/domain/customer/events/customer-created.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(CustomerCreated)
class OnCustomerCreatedActivityHandler implements IEventHandler<CustomerCreated> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: CustomerCreated): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.CUSTOMER_CREATED,
      event.createdBy,
      null,
      'Customer',
      event.customerId,
      event.name,
      null,
      null,
      { customerId: event.customerId, name: event.name },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnCustomerCreatedActivityHandler;
