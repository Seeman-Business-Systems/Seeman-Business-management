import ExpenseCategory from '../expense-category';

class ExpenseCreated {
  constructor(
    public readonly expenseId: number,
    public readonly amount: number,
    public readonly category: ExpenseCategory,
    public readonly description: string,
    public readonly branchId: number,
    public readonly recordedBy: number,
  ) {}
}

export default ExpenseCreated;
