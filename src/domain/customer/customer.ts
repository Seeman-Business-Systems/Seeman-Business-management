class Customer {
  constructor(
    public id: number | undefined,
    public name: string,
    public phoneNumber: string,
    public notes: string,
    public createdAt: Date,
    public updatedAt: Date,
    public createdBy: number,
    public companyName?: string,
    public altPhoneNumber?: string,
    public email?: string,
    public deletedAt?: Date,
  ) {}

  getId(): number {
    return this.id!;
  }

  getName(): string {
    return this.name;
  }

  getPhoneNumber(): string {
    return this.phoneNumber;
  }

  getAltPhoneNumber(): string | undefined {
    return this.altPhoneNumber;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getNotes(): string {
    return this.notes;
  }

  getCompanyName(): string | undefined {
    return this.companyName;
  }

  getEmail(): string | undefined {
    return this.email;
  }

  getDeletedAt(): Date | undefined {
    return this.deletedAt;
  }

  setName(name: string): void {
    this.name = name;
  }

  setPhoneNumber(phoneNumber: string): void {
    this.phoneNumber = phoneNumber;
  }

  setAltPhoneNumber(altPhoneNumber: string): void {
    this.altPhoneNumber = altPhoneNumber;
  }

  setNotes(notes: string): void {
    this.notes = notes;
  }

  setCompanyName(companyName?: string): void {
    this.companyName = companyName;
  }

  setEmail(email?: string): void {
    this.email = email;
  }

  setDeletedAt(deletedAt?: Date): void {
    this.deletedAt = deletedAt;
  }

  setUpdatedAt(date: Date): void {
    this.updatedAt = date;
  }

  getCreatedBy(): number {
    return this.createdBy;
  }

  setCreatedBy(createdBy: number): void {
    this.createdBy = createdBy;
  }
}

export default Customer;
