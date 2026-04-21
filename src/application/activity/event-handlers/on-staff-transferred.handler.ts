import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import StaffTransferred from 'src/domain/staff/events/staff-transferred.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(StaffTransferred)
class OnStaffTransferredActivityHandler implements IEventHandler<StaffTransferred> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: StaffTransferred): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.STAFF_TRANSFERRED,
      event.transferredBy,
      null,
      'Staff',
      event.staffId,
      event.staffName,
      event.toBranchId,
      null,
      {
        staffName: event.staffName,
        fromBranchId: event.fromBranchId,
        fromBranchName: event.fromBranchName,
        toBranchId: event.toBranchId,
        toBranchName: event.toBranchName,
      },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnStaffTransferredActivityHandler;
