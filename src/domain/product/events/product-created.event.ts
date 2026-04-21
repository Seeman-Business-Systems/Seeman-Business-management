class ProductCreated {
  constructor(
    public readonly productId: number,
    public readonly name: string,
    public readonly createdBy: number,
  ) {}
}

export default ProductCreated;
