class OffloadBatchCommand {
  constructor(
    public readonly batchId: number,
    public readonly actorId: number,
  ) {}
}

export default OffloadBatchCommand;
