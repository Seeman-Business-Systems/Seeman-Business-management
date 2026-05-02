class RemoveBatchItemCommand {
  constructor(
    public readonly batchId: number,
    public readonly itemId: number,
  ) {}
}

export default RemoveBatchItemCommand;
