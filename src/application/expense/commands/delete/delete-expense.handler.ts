import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import ExpenseRepository from 'src/infrastructure/database/repositories/expense/expense.repository';
import DeleteExpenseCommand from './delete-expense.command';

@CommandHandler(DeleteExpenseCommand)
class DeleteExpenseHandler implements ICommandHandler<DeleteExpenseCommand> {
  constructor(private readonly expenses: ExpenseRepository) {}

  async execute(command: DeleteExpenseCommand): Promise<void> {
    const expense = await this.expenses.findById(command.expenseId);
    if (!expense) throw new NotFoundException(`Expense #${command.expenseId} not found`);
    await this.expenses.delete(command.expenseId);
  }
}

export default DeleteExpenseHandler;
