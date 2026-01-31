class PasswordResetToken {
  constructor(
    public id: number | undefined,
    public token: string,
    public staffId: number,
    public expiresAt: Date,
    public createdAt: Date,
    public usedAt: Date | undefined,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getToken(): string {
    return this.token;
  }

  getStaffId(): number {
    return this.staffId;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getUsedAt(): Date | undefined {
    return this.usedAt;
  }

  setUsedAt(usedAt: Date): void {
    this.usedAt = usedAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  isUsed(): boolean {
    return !!this.usedAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isUsed() && !this.isExpired();
  }
}

export default PasswordResetToken;
