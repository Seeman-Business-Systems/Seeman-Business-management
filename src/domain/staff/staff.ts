class Staff {
  constructor(
    public id: number | undefined,
    public firstName: string,
    public lastName: string,
    public phoneNumber: string,
    public roleId: number,
    public branchId: number,
    public createdAt: Date,
    public updatedAt: Date,
    public password: string,
    public createdBy: number,
    public initialPasswordChanged: boolean,
    public lastLoginAt?: Date,
    public middleName?: string,
    public email?: string,
    public joinedAt?: Date,
    public deletedAt?: Date,
  ) {}

  getId(): number {
    return this.id!;
  }

  getFirstName(): string {
    return this.firstName;
  }

  setFirstName(firstName: string): void {
    this.firstName = firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  setLastName(lastName: string): void {
    this.lastName = lastName;
  }

  getPhoneNumber(): string {
    return this.phoneNumber;
  }

  setPhoneNumber(phoneNumber: string): void {
    this.phoneNumber = phoneNumber;
  }

  getRoleId(): number {
    return this.roleId;
  }

  setRoleId(roleId: number): void {
    this.roleId = roleId;
  }

  getMiddleName(): string | undefined {
    return this.middleName;
  }

  setMiddleName(middleName: string): void {
    this.middleName = middleName;
  }

  getEmail(): string | undefined {
    return this.email;
  }

  setEmail(email: string): void {
    this.email = email;
  }

  getFullName(): string {
    return `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`;
  }

  getBranchId(): number {
    return this.branchId;
  }

  setBranchId(branchId: number): void {
    this.branchId = branchId;
  }

  getJoinedAt(): Date | undefined {
    return this.joinedAt;
  }

  setJoinedAt(joinedAt: Date): void {
    this.joinedAt = joinedAt;
  }

  getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }

  getDeletedAt(): Date | undefined {
    return this.deletedAt;
  }

  setDeletedAt(deletedAt: Date): void {
    this.deletedAt = deletedAt;
  }

  setPassword(password: string): void {
    this.password = password;
  }

  getPassword(): string {
    return this.password;
  }

  getCreatedBy(): number {
    return this.createdBy;
  }

  setCreatedBy(createdBy: number): void {
    this.createdBy = createdBy;
  }

  getLastLoginAt(): Date | undefined {
    return this.lastLoginAt;
  }

  setLastLoginAt(lastLoginAt: Date): void {
    this.lastLoginAt = lastLoginAt;
  }

  getInitialPasswordChanged(): boolean {
    return this.initialPasswordChanged;
  }

  setInitialPasswordChanged(initialPasswordChanged: boolean): void {
    this.initialPasswordChanged = initialPasswordChanged;
  }
}

export default Staff;
