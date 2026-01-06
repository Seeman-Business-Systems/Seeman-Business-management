class Customer {
  constructor(
    public id: number | undefined,
    public name: string,
    public email: string | null,
    public notes: string | null,
    public phoneNumber: string,
    public companyName: string | null,
    public altPhoneNumber: string | null,
    public creditLimit: number,
    public outstandingBalance: number,
    public createdBy: number,
    public createdAt: Date,
    public updatedAt: Date,
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

  getAltPhoneNumber(): string | null {
    return this.altPhoneNumber;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getNotes(): string | null {
    return this.notes;
  }

  getCompanyName(): string | null {
    return this.companyName;
  }

  getEmail(): string | null {
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

  setCompanyName(companyName: string): void {
    this.companyName = companyName;
  }

  setEmail(email: string): void {
    this.email = email;
  }

  setDeletedAt(deletedAt: Date): void {
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

  getCreditLimit(): number {
    return this.creditLimit;
  }

  setCreditLimit(creditLimit: number): void {
    this.creditLimit = creditLimit;
  }

  getOutstandingBalance(): number {
    return this.outstandingBalance;
  }

  setOutstandingBalance(outstandingBalance: number): void {
    this.outstandingBalance = outstandingBalance;
  }

  getAvailableCredit(): number {
    return this.creditLimit - this.outstandingBalance;
  }
}

export default Customer;
