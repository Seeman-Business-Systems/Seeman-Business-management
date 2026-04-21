import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import ExpenseCreated from 'src/domain/expense/events/expense-created.event';
import Activity from 'src/domain/activity/activity';
import ActivityType from 'src/domain/activity/activity-type';
import ActivityRepository from 'src/infrastructure/database/repositories/activity/activity.repository';

@EventsHandler(ExpenseCreated)
class OnExpenseCreatedActivityHandler implements IEventHandler<ExpenseCreated> {
  constructor(private readonly activities: ActivityRepository) {}

  async handle(event: ExpenseCreated): Promise<void> {
    const activity = new Activity(
      undefined,
      ActivityType.EXPENSE_RECORDED,
      event.recordedBy,
      null,
      'Expense',
      event.expenseId,
      event.description,
      event.branchId,
      null,
      {
        amount: event.amount,
        category: event.category,
        description: event.description,
      },
      new Date(),
    );

    await this.activities.commit(activity);
  }
}

export default OnExpenseCreatedActivityHandler;
