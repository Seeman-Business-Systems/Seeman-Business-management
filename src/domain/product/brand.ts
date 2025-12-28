class Brand {
  constructor(
    public id: number | undefined,
    public name: string,
    public code: string,
    public description: string | null,
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

  getCode(): string {
    return this.code;
  }

  setCode(code: string): void {
    this.code = code;
  }

  static makeCode(name: string): string {
    return name.substring(0, 3).toUpperCase();
  }

  getDescription(): string | null {
    return this.description;
  }

  setDescription(description: string | null): void {
    this.description = description;
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

export default Brand;
