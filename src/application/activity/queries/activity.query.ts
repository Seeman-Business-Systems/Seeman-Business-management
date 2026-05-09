import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ActivityEntity from 'src/infrastructure/database/entities/activity.entity';
import ActivityDBRepository from 'src/infrastructure/database/repositories/activity/activity.db-repository';
import Activity from 'src/domain/activity/activity';
import type ActivityFilters from './activity.filters';

@Injectable()
class ActivityQuery {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly repository: Repository<ActivityEntity>,
    private readonly activityRepo: ActivityDBRepository,
  ) {}

  async findBy(filters: ActivityFilters): Promise<{ data: Activity[]; total: number }> {
    const take = filters.take ?? 20;
    const skip = filters.skip ?? 0;

    const qb = this.repository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.actor', 'actor')
      .orderBy('activity.createdAt', 'DESC')
      .take(take)
      .skip(skip);

    if (filters.actorId) {
      qb.andWhere('activity.actorId = :actorId', { actorId: filters.actorId });
    }

    if (filters.branchId) {
      // Warehouse activities (warehouseId set, branchId null) are included when
      // their warehouse belongs to this branch — we store branchId on warehouse
      // activities too, so a single filter covers both.
      qb.andWhere('activity.branchId = :branchId', { branchId: filters.branchId });
    }

    if (filters.warehouseId) {
      qb.andWhere('activity.warehouseId = :warehouseId', { warehouseId: filters.warehouseId });
    }

    if (filters.entityType) {
      qb.andWhere('activity.entityType = :entityType', { entityType: filters.entityType });
    }

    if (filters.entityId) {
      qb.andWhere('activity.entityId = :entityId', { entityId: filters.entityId });
    }

    if (filters.variantId) {
      qb.andWhere(`(activity.metadata->>'variantId')::int = :variantId`, {
        variantId: filters.variantId,
      });
    }

    if (filters.type) {
      qb.andWhere('activity.type = :type', { type: filters.type });
    }

    if (filters.dateFrom) {
      qb.andWhere('activity.createdAt >= :dateFrom', { dateFrom: new Date(filters.dateFrom) });
    }

    if (filters.dateTo) {
      qb.andWhere('activity.createdAt <= :dateTo', { dateTo: new Date(filters.dateTo) });
    }

    const [records, total] = await qb.getManyAndCount();

    return {
      data: records.map((e) => this.activityRepo.toDomain(e)),
      total,
    };
  }
}

export default ActivityQuery;
