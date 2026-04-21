export type ExpenseCategory =
  | 'RENT'
  | 'UTILITIES'
  | 'SALARIES'
  | 'WAYBILLFEES'
  | 'MAINTENANCE'
  | 'MISCELLANEOUS'
  | 'FEEDING'
  | 'DAILY_TRANSPORT';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  RENT: 'Rent',
  UTILITIES: 'Utilities',
  SALARIES: 'Salaries',
  WAYBILLFEES: 'Waybill Fees',
  MAINTENANCE: 'Maintenance',
  MISCELLANEOUS: 'Miscellaneous',
  FEEDING: 'Feeding',
  DAILY_TRANSPORT: 'Daily Transport',
};

export interface Expense {
  id: number;
  amount: number;
  category: ExpenseCategory;
  description: string;
  branchId: number;
  branchName: string | null;
  recordedBy: number;
  recordedByName: string | null;
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilters {
  branchId?: number;
  category?: ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
  take?: number;
  skip?: number;
}

export interface CreateExpenseRequest {
  amount: number;
  category: ExpenseCategory;
  description: string;
  branchId: number;
  date: string;
  notes?: string;
}

export interface ExpenseListResponse {
  data: Expense[];
  total: number;
}
