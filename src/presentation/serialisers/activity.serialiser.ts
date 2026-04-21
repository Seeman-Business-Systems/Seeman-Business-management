import { Injectable } from '@nestjs/common';
import Activity from 'src/domain/activity/activity';

@Injectable()
class ActivitySerialiser {
  serialise(activity: Activity) {
    return {
      id: activity.getId(),
      type: activity.getType(),
      actorId: activity.getActorId(),
      actorName: activity.getActorName(),
      entityType: activity.getEntityType(),
      entityId: activity.getEntityId(),
      entityLabel: activity.getEntityLabel(),
      branchId: activity.getBranchId(),
      warehouseId: activity.getWarehouseId(),
      metadata: activity.getMetadata(),
      createdAt: activity.getCreatedAt(),
    };
  }

  serialiseMany(activities: Activity[]) {
    return activities.map((a) => this.serialise(a));
  }
}

export default ActivitySerialiser;
