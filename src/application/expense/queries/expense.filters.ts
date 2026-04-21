import ExpenseCategory from 'src/domain/expense/expense-category';

export interface ExpenseFilters {
  branchId?: number;
  category?: ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
  take?: number;
  skip?: number;
}
