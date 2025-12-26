class BranchCreated {
  constructor(
    public readonly branchId: number,
    public readonly name: string,
    public readonly createdBy: number,
    public readonly createdAt: Date,
    public readonly code?: string,
  ) {}
}

export default BranchCreated;
