import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import Expense from 'src/domain/expense/expense';
import ExpenseRepository from 'src/infrastructure/database/repositories/expense/expense.repository';
import ExpenseCreated from 'src/domain/expense/events/expense-created.event';
import CreateExpenseCommand from './create-expense.command';

@CommandHandler(CreateExpenseCommand)
class CreateExpenseHandler implements ICommandHandler<CreateExpenseCommand> {
  constructor(
    private readonly expenses: ExpenseRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateExpenseCommand): Promise<Expense> {
    const expense = new Expense(
      undefined,
      command.amount,
      command.category,
      command.description,
      command.branchId,
      command.recordedBy,
      null,
      command.date,
      command.notes,
      new Date(),
      new Date(),
    );

    const saved = await this.expenses.commit(expense);

    this.eventBus.publish(
      new ExpenseCreated(
        saved.getId()!,
        saved.getAmount(),
        saved.getCategory(),
        saved.getDescription(),
        saved.getBranchId(),
        command.recordedBy,
      ),
    );

    return saved;
  }
}

export default CreateExpenseHandler;
