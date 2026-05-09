import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import ActivityQuery from 'src/application/activity/queries/activity.query';
import type ActivityFilters from 'src/application/activity/queries/activity.filters';
import ActivitySerialiser from 'src/presentation/serialisers/activity.serialiser';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import BranchScope from 'src/modules/auth/services/branch-scope.service';
import Staff from 'src/domain/staff/staff';

@Controller('activities')
@UseGuards(JwtAuthGuard)
class ActivityController {
  constructor(
    private readonly activityQuery: ActivityQuery,
    private readonly serialiser: ActivitySerialiser,
    private readonly branchScope: BranchScope,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.ACTIVITY_READ)
  async findAll(@Query() filters: ActivityFilters, @Actor() actor: Staff) {
    const branchId = await this.branchScope.resolve(
      actor,
      filters.branchId ? Number(filters.branchId) : undefined,
    );

    const result = await this.activityQuery.findBy({
      ...filters,
      take: filters.take ? Number(filters.take) : 20,
      skip: filters.skip ? Number(filters.skip) : 0,
      actorId: filters.actorId ? Number(filters.actorId) : undefined,
      branchId,
      warehouseId: filters.warehouseId ? Number(filters.warehouseId) : undefined,
      entityId: filters.entityId ? Number(filters.entityId) : undefined,
      variantId: filters.variantId ? Number(filters.variantId) : undefined,
    });

    return {
      data: this.serialiser.serialiseMany(result.data),
      total: result.total,
    };
  }
}

export default ActivityController;
