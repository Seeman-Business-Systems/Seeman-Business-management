import SupplyStatus from './supply-status';
import SupplyItem from './supply-item';

class Supply {
  constructor(
    private id: number | undefined,
    private supplyNumber: string,
    private saleId: number,
    private saleNumber: string,
    private branchId: number,
    private status: SupplyStatus,
    private notes: string | null,
    private suppliedBy: number | null,
    private items: SupplyItem[],
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getSupplyNumber(): string {
    return this.supplyNumber;
  }

  getSaleId(): number {
    return this.saleId;
  }

  getSaleNumber(): string {
    return this.saleNumber;
  }

  getBranchId(): number {
    return this.branchId;
  }

  getStatus(): SupplyStatus {
    return this.status;
  }

  setStatus(status: SupplyStatus): void {
    this.status = status;
  }

  getNotes(): string | null {
    return this.notes;
  }

  setNotes(notes: string | null): void {
    this.notes = notes;
  }

  getSuppliedBy(): number | null {
    return this.suppliedBy;
  }

  setSuppliedBy(suppliedBy: number | null): void {
    this.suppliedBy = suppliedBy;
  }

  getItems(): SupplyItem[] {
    return this.items;
  }

  setItems(items: SupplyItem[]): void {
    this.items = items;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }

  isDraft(): boolean {
    return this.status === SupplyStatus.DRAFT;
  }

  isFulfilled(): boolean {
    return this.status === SupplyStatus.FULFILLED;
  }
}

export default Supply;
