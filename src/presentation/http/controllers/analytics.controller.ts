import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import AnalyticsSummaryQuery from 'src/application/analytics/analytics-summary.query';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
class AnalyticsController {
  constructor(private readonly summaryQuery: AnalyticsSummaryQuery) {}

  @Get('summary')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getSummary(@Query() query: any) {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    return this.summaryQuery.getSummary({
      dateFrom: query.dateFrom ?? firstOfMonth,
      dateTo: query.dateTo ?? todayStr,
      branchId: query.branchId ? Number(query.branchId) : undefined,
    });
  }
}

export default AnalyticsController;
