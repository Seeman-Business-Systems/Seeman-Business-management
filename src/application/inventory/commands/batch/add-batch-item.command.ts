class AddBatchItemCommand {
  constructor(
    public readonly batchId: number,
    public readonly variantId: number,
    public readonly warehouseId: number,
    public readonly quantity: number,
  ) {}
}

export default AddBatchItemCommand;
