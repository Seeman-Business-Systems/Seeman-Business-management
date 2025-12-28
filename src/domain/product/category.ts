class Category {
  constructor(
    public id: number | undefined,
    public name: string,
    public description: string | null,
    public parentId: number | null,
    public createdBy: number,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt?: Date,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getDescription(): string | null {
    return this.description;
  }

  setDescription(description: string | null): void {
    this.description = description;
  }

  getParentId(): number | null {
    return this.parentId;
  }

  setParentId(parentId: number | null): void {
    this.parentId = parentId;
  }

  getCreatedBy(): number {
    return this.createdBy;
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

  getDeletedAt(): Date | undefined {
    return this.deletedAt;
  }

  setDeletedAt(deletedAt: Date | undefined): void {
    this.deletedAt = deletedAt;
  }
}

export default Category;
