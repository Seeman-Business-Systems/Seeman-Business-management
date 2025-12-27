import WarehouseStatus from './warehouse-status';
import WarehouseType from './warehouse-type';

class Warehouse {
  constructor(
    public id: number | undefined,
    public name: string,
    public address: string,
    public city: string,
    public state: string,
    public status: WarehouseStatus,
    public phoneNumber: string,
    public branchId: number | null,
    public managerId: number | null,
    public warehouseType: WarehouseType,
    public capacity: number | null,
    public createdBy: number,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt?: Date,
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

  getStatus(): WarehouseStatus {
    return this.status;
  }

  setStatus(status: WarehouseStatus): void {
    this.status = status;
  }

  getPhoneNumber(): string {
    return this.phoneNumber;
  }

  setPhoneNumber(phoneNumber: string): void {
    this.phoneNumber = phoneNumber;
  }

  getBranchId(): number | null {
    return this.branchId;
  }

  setBranchId(branchId: number | null): void {
    this.branchId = branchId;
  }

  getManagerId(): number | null {
    return this.managerId;
  }

  setManagerId(managerId: number | null): void {
    this.managerId = managerId;
  }

  getWarehouseType(): WarehouseType {
    return this.warehouseType;
  }

  setWarehouseType(warehouseType: WarehouseType): void {
    this.warehouseType = warehouseType;
  }

  getCapacity(): number | null {
    return this.capacity;
  }

  setCapacity(capacity: number | null): void {
    this.capacity = capacity;
  }

  getCreatedBy(): number {
    return this.createdBy;
  }

  setCreatedBy(createdBy: number): void {
    this.createdBy = createdBy;
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
}

export default Warehouse;
