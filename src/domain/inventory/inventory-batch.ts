class InventoryBatch {
  constructor(
    private id: number | undefined,
    private batchNumber: string,
    private arrivedAt: Date,
    private notes: string | null,
    private offloadedAt: Date | null,
    private createdBy: number,
    private createdAt: Date,
  ) {}

  getId(): number | undefined { return this.id; }
  getBatchNumber(): string { return this.batchNumber; }
  setBatchNumber(v: string): void { this.batchNumber = v; }
  getArrivedAt(): Date { return this.arrivedAt; }
  setArrivedAt(v: Date): void { this.arrivedAt = v; }
  getNotes(): string | null { return this.notes; }
  setNotes(v: string | null): void { this.notes = v; }
  getOffloadedAt(): Date | null { return this.offloadedAt; }
  setOffloadedAt(v: Date): void { this.offloadedAt = v; }
  getCreatedBy(): number { return this.createdBy; }
  getCreatedAt(): Date { return this.createdAt; }

  isOffloaded(): boolean { return this.offloadedAt !== null; }
}

export default InventoryBatch;
