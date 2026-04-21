import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import PaymentRecorded from 'src/domain/sale/events/payment-recorded.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(PaymentRecorded)
class OnPaymentRecordedActivityHandler implements IEventHandler<PaymentRecorded> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: PaymentRecorded): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.PAYMENT_RECORDED,
      event.recordedBy,
      null,
      'Sale',
      event.saleId,
      event.saleNumber,
      event.branchId,
      null,
      {
        saleNumber: event.saleNumber,
        amount: event.amount,
      },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnPaymentRecordedActivityHandler;
