import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Activity from 'src/domain/activity/activity';
import ActivityEntity from '../../entities/activity.entity';
import ActivityRepository from './activity.repository';

@Injectable()
class ActivityDBRepository extends ActivityRepository {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly repository: Repository<ActivityEntity>,
  ) {
    super();
  }

  async commit(activity: Activity): Promise<Activity> {
    const entity = new ActivityEntity();
    entity.type = activity.getType();
    entity.actorId = activity.getActorId();
    entity.entityType = activity.getEntityType();
    entity.entityId = activity.getEntityId();
    entity.entityLabel = activity.getEntityLabel();
    entity.branchId = activity.getBranchId();
    entity.warehouseId = activity.getWarehouseId();
    entity.metadata = activity.getMetadata();

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  toDomain(entity: ActivityEntity): Activity {
    const actorName = entity.actor
      ? `${entity.actor.firstName} ${entity.actor.lastName}`
      : entity.actorId === 0
        ? 'System Actor'
        : null;

    return new Activity(
      entity.id,
      entity.type,
      entity.actorId,
      actorName,
      entity.entityType,
      entity.entityId,
      entity.entityLabel,
      entity.branchId,
      entity.warehouseId,
      entity.metadata,
      entity.createdAt,
    );
  }
}

export default ActivityDBRepository;
