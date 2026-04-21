import ActivityType from './activity-type';

class Activity {
  constructor(
    private id: number | undefined,
    private type: ActivityType,
    private actorId: number,
    private actorName: string | null,
    private entityType: string,
    private entityId: number | null,
    private entityLabel: string | null,
    private branchId: number | null,
    private warehouseId: number | null,
    private metadata: Record<string, unknown> | null,
    private createdAt: Date,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getType(): ActivityType {
    return this.type;
  }

  getActorId(): number {
    return this.actorId;
  }

  getActorName(): string | null {
    return this.actorName;
  }

  getEntityType(): string {
    return this.entityType;
  }

  getEntityId(): number | null {
    return this.entityId;
  }

  getEntityLabel(): string | null {
    return this.entityLabel;
  }

  getBranchId(): number | null {
    return this.branchId;
  }

  getWarehouseId(): number | null {
    return this.warehouseId;
  }

  getMetadata(): Record<string, unknown> | null {
    return this.metadata;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}

export default Activity;
