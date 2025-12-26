// import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
// import BranchCreatedEvent from './branch-created.event';

// @EventsHandler(BranchCreatedEvent)
// export class BranchCreatedHandler implements IEventHandler<BranchCreatedEvent> {
//   constructor(
//     private activityRepo: ActivityRepository,  // Log activities
//     private notificationService: NotificationService,
//   ) {}

//   async handle(event: BranchCreatedEvent) {
//     // Log the activity
//     await this.activityRepo.create({
//       action: 'BRANCH_CREATED',
//       entityType: 'Branch',
//       entityId: event.branchId,
//       performedBy: event.createdBy,
//       timestamp: event.timestamp,
//       details: `Branch "${event.branchName}" was created`,
//     });

//     // Notify CEO
//     await this.notificationService.notifyCEO(
//       `New branch "${event.branchName}" has been created`
//     );

//     // Any other side effects...
//   }
// }