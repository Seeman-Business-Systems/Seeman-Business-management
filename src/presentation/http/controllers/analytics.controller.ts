import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import AnalyticsSummaryQuery from 'src/application/analytics/analytics-summary.query';
import { ReportsQuery } from 'src/application/analytics/reports.query';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';
import Actor from 'src/modules/auth/decorators/actor.decorator';
import BranchScope from 'src/modules/auth/services/branch-scope.service';
import Staff from 'src/domain/staff/staff';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
class AnalyticsController {
  constructor(
    private readonly summaryQuery: AnalyticsSummaryQuery,
    private readonly reportsQuery: ReportsQuery,
    private readonly branchScope: BranchScope,
  ) {}

  private async resolveBranchId(actor: Staff, raw: unknown): Promise<number | undefined> {
    return this.branchScope.resolve(actor, raw ? Number(raw) : undefined);
  }

  @Get('summary')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getSummary(@Query() query: any, @Actor() actor: Staff) {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    return this.summaryQuery.getSummary({
      dateFrom: query.dateFrom ?? firstOfMonth,
      dateTo: query.dateTo ?? todayStr,
      branchId: await this.resolveBranchId(actor, query.branchId),
    });
  }

  @Get('reports/sales')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getSalesReport(@Query() query: any, @Actor() actor: Staff) {
    return this.reportsQuery.getSalesReport({
      dateFrom: query.dateFrom ?? this.firstOfMonth(),
      dateTo: query.dateTo ?? this.today(),
      branchId: await this.resolveBranchId(actor, query.branchId),
    });
  }

  @Get('reports/expenses')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getExpensesReport(@Query() query: any, @Actor() actor: Staff) {
    return this.reportsQuery.getExpensesReport({
      dateFrom: query.dateFrom ?? this.firstOfMonth(),
      dateTo: query.dateTo ?? this.today(),
      branchId: await this.resolveBranchId(actor, query.branchId),
    });
  }

  @Get('reports/inventory')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getInventoryReport(@Query() query: any, @Actor() actor: Staff) {
    return this.reportsQuery.getInventoryReport({
      branchId: await this.resolveBranchId(actor, query.branchId),
    });
  }

  @Get('reports/products')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getProductsReport(@Query() query: any, @Actor() actor: Staff) {
    return this.reportsQuery.getProductsReport({
      dateFrom: query.dateFrom ?? this.firstOfMonth(),
      dateTo: query.dateTo ?? this.today(),
      branchId: await this.resolveBranchId(actor, query.branchId),
    });
  }

  @Get('reports/customers')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getCustomersReport(@Query() query: any, @Actor() actor: Staff) {
    return this.reportsQuery.getCustomersReport({
      dateFrom: query.dateFrom ?? this.firstOfMonth(),
      dateTo: query.dateTo ?? this.today(),
      branchId: await this.resolveBranchId(actor, query.branchId),
    });
  }

  @Get('reports/staff')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getStaffReport(@Query() query: any, @Actor() actor: Staff) {
    return this.reportsQuery.getStaffReport({
      dateFrom: query.dateFrom ?? this.firstOfMonth(),
      dateTo: query.dateTo ?? this.today(),
      branchId: await this.resolveBranchId(actor, query.branchId),
    });
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private firstOfMonth(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  }
}

export default AnalyticsController;
