import { Command } from '@nestjs/cqrs';
import Expense from 'src/domain/expense/expense';
import ExpenseCategory from 'src/domain/expense/expense-category';

class CreateExpenseCommand extends Command<Expense> {
  constructor(
    public readonly amount: number,
    public readonly category: ExpenseCategory,
    public readonly description: string,
    public readonly branchId: number,
    public readonly recordedBy: number,
    public readonly date: Date,
    public readonly notes: string | null,
  ) {
    super();
  }
}

export default CreateExpenseCommand;
