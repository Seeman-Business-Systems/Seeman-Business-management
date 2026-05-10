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
    private idempotencyKey: string | null = null,
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
  getIdempotencyKey(): string | null { return this.idempotencyKey; }

  setAmount(amount: number): void { this.amount = amount; }
  setCategory(category: ExpenseCategory): void { this.category = category; }
  setDescription(description: string): void { this.description = description; }
  setBranchId(branchId: number): void { this.branchId = branchId; }
  setDate(date: Date): void { this.date = date; }
  setNotes(notes: string | null): void { this.notes = notes; }
  setUpdatedAt(updatedAt: Date): void { this.updatedAt = updatedAt; }
}

export default Expense;
