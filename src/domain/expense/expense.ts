import ExpenseCategory from './expense-category';

class Expense {
  constructor(
    private id: number | undefined,
    private amount: number,
    private category: ExpenseCategory,
    private description: string,
    private branchId: number,
    private recordedBy: number,
    private recordedByName: string | null,
    private date: Date,
    private notes: string | null,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  getId(): number | undefined { return this.id; }
  getAmount(): number { return this.amount; }
  getCategory(): ExpenseCategory { return this.category; }
  getDescription(): string { return this.description; }
  getBranchId(): number { return this.branchId; }
  getRecordedBy(): number { return this.recordedBy; }
  getRecordedByName(): string | null { return this.recordedByName; }
  getDate(): Date { return this.date; }
  getNotes(): string | null { return this.notes; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  setUpdatedAt(updatedAt: Date): void { this.updatedAt = updatedAt; }
}

export default Expense;
