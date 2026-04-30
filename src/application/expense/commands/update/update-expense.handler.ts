import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import UpdateExpenseCommand from './update-expense.command';
import Expense from 'src/domain/expense/expense';
import ExpenseRepository from 'src/infrastructure/database/repositories/expense/expense.repository';

@CommandHandler(UpdateExpenseCommand)
class UpdateExpenseHandler implements ICommandHandler<UpdateExpenseCommand> {
  constructor(private readonly expenses: ExpenseRepository) {}

  async execute(command: UpdateExpenseCommand): Promise<Expense> {
    const expense = await this.expenses.findById(command.expenseId);

    if (!expense) {
      throw new NotFoundException(`Expense with id ${command.expenseId} not found`);
    }

    expense.setAmount(command.amount);
    expense.setCategory(command.category);
    expense.setDescription(command.description);
    expense.setBranchId(command.branchId);
    expense.setDate(command.date);
    expense.setNotes(command.notes);

    return this.expenses.commit(expense);
  }
}

export default UpdateExpenseHandler;
