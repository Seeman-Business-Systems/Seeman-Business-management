class RefreshToken {
  constructor(
    public id: number | undefined,
    public token: string,
    public staffId: number,
    public expiresAt: Date,
    public createdAt: Date,
    public revokedAt: Date | undefined,
  ) {}

  getId(): number | undefined {
    if (!this.id) return undefined;

    return this.id;
  }

  getToken(): string {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  getStaffId(): number {
    return this.staffId;
  }

  setStaffId(staffId: number): void {
    this.staffId = staffId;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  setExpiresAt(expiresAt: Date): void {
    this.expiresAt = expiresAt;
  }

  getRevokedAt(): Date | undefined {
    return this.revokedAt;
  }

  setRevokedAt(revokedAt: Date | undefined): void {
    this.revokedAt = revokedAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  isRevoked(): boolean {
    return !!this.revokedAt;
  }
}

export default RefreshToken;
