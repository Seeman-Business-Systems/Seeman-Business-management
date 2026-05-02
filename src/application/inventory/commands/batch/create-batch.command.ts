export interface CreateBatchItemInput {
  variantId: number;
  warehouseId: number;
  quantity: number;
}

class CreateBatchCommand {
  constructor(
    public readonly batchNumber: string,
    public readonly arrivedAt: Date,
    public readonly notes: string | null,
    public readonly actorId: number,
    public readonly items: CreateBatchItemInput[] = [],
  ) {}
}

export default CreateBatchCommand;
