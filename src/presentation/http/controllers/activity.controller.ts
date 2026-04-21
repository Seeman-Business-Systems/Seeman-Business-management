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

@Controller('activities')
@UseGuards(JwtAuthGuard)
class ActivityController {
  constructor(
    private readonly activityQuery: ActivityQuery,
    private readonly serialiser: ActivitySerialiser,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filters: ActivityFilters) {
    const result = await this.activityQuery.findBy({
      ...filters,
      take: filters.take ? Number(filters.take) : 20,
      skip: filters.skip ? Number(filters.skip) : 0,
      actorId: filters.actorId ? Number(filters.actorId) : undefined,
      branchId: filters.branchId ? Number(filters.branchId) : undefined,
      warehouseId: filters.warehouseId ? Number(filters.warehouseId) : undefined,
      entityId: filters.entityId ? Number(filters.entityId) : undefined,
    });

    return {
      data: this.serialiser.serialiseMany(result.data),
      total: result.total,
    };
  }
}

export default ActivityController;
