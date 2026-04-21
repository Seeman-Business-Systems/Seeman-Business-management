class CustomerCreated {
  constructor(
    public readonly customerId: number,
    public readonly name: string,
    public readonly createdBy: number,
  ) {}
}

export default CustomerCreated;
