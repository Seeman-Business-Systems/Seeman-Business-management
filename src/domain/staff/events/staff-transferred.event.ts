class StaffTransferred {
  constructor(
    public readonly staffId: number,
    public readonly staffName: string,
    public readonly fromBranchId: number,
    public readonly fromBranchName: string,
    public readonly toBranchId: number,
    public readonly toBranchName: string,
    public readonly transferredBy: number,
  ) {}
}

export default StaffTransferred;
