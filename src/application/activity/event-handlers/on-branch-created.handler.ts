import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import BranchCreated from 'src/domain/branch/events/branch-created.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(BranchCreated)
class OnBranchCreatedActivityHandler implements IEventHandler<BranchCreated> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: BranchCreated): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.BRANCH_CREATED,
      event.createdBy,
      null,
      'Branch',
      event.branchId,
      event.name,
      event.branchId,
      null,
      { branchId: event.branchId, name: event.name, code: event.code ?? null },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnBranchCreatedActivityHandler;
