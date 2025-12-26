import BranchStatus from './branch-status';

class Branch {
  constructor(
    public id: number | undefined,
    public name: string,
    public address: string,
    public city: string,
    public state: string,
    public status: BranchStatus,
    public phoneNumber: string,
    public managerId: number,
    public isHeadOffice: boolean,
    public createdBy: number,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt?: Date,
    public altPhoneNumber?: string,
    public code?: string,
  ) {}

  getId(): number | undefined {
    return this.id!;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getAddress(): string {
    return this.address;
  }

  setAddress(address: string): void {
    this.address = address;
  }

  getCity(): string {
    return this.city;
  }

  setCity(city: string): void {
    this.city = city;
  }

  getState(): string {
    return this.state;
  }

  setState(state: string): void {
    this.state = state;
  }

  getStatus(): BranchStatus {
    return this.status;
  }

  setStatus(status: BranchStatus): void {
    this.status = status;
  }

  getPhoneNumber(): string {
    return this.phoneNumber;
  }

  setPhoneNumber(phoneNumber: string): void {
    this.phoneNumber = phoneNumber;
  }

  getManagerId(): number {
    return this.managerId;
  }

  setManagerId(managerId: number): void {
    this.managerId = managerId;
  }

  getIsHeadOffice(): boolean {
    return this.isHeadOffice;
  }

  setIsHeadOffice(isHeadOffice: boolean): void {
    this.isHeadOffice = isHeadOffice ?? false;
  }

  getAltPhoneNumber(): string | undefined {
    return this.altPhoneNumber;
  }

  setAltPhoneNumber(altPhoneNumber: string): void {
    this.altPhoneNumber = altPhoneNumber;
  }

  getCode(): string | undefined {
    return this.code;
  }

  setCode(code: string): void {
    this.code = code ?? this.makeCode();
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

  getCreatedBy(): number {
    return this.createdBy;
  }

  setCreatedBy(staffId: number): void {
    this.createdBy = staffId;
  }

  private makeCode(): string {
    return this.name.trim().toUpperCase().substring(0, 3);
  }
}

export default Branch;
