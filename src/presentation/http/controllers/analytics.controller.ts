import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import AnalyticsSummaryQuery from 'src/application/analytics/analytics-summary.query';
import { ReportsQuery } from 'src/application/analytics/reports.query';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
class AnalyticsController {
  constructor(
    private readonly summaryQuery: AnalyticsSummaryQuery,
    private readonly reportsQuery: ReportsQuery,
  ) {}

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

  @Get('reports/sales')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getSalesReport(@Query() query: any) {
    return this.reportsQuery.getSalesReport({
      dateFrom: query.dateFrom ?? this.firstOfMonth(),
      dateTo: query.dateTo ?? this.today(),
      branchId: query.branchId ? Number(query.branchId) : undefined,
    });
  }

  @Get('reports/expenses')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getExpensesReport(@Query() query: any) {
    return this.reportsQuery.getExpensesReport({
      dateFrom: query.dateFrom ?? this.firstOfMonth(),
      dateTo: query.dateTo ?? this.today(),
      branchId: query.branchId ? Number(query.branchId) : undefined,
    });
  }

  @Get('reports/inventory')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getInventoryReport(@Query() query: any) {
    return this.reportsQuery.getInventoryReport({
      branchId: query.branchId ? Number(query.branchId) : undefined,
    });
  }

  @Get('reports/products')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getProductsReport(@Query() query: any) {
    return this.reportsQuery.getProductsReport({
      dateFrom: query.dateFrom ?? this.firstOfMonth(),
      dateTo: query.dateTo ?? this.today(),
      branchId: query.branchId ? Number(query.branchId) : undefined,
    });
  }

  @Get('reports/customers')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getCustomersReport(@Query() query: any) {
    return this.reportsQuery.getCustomersReport({
      dateFrom: query.dateFrom ?? this.firstOfMonth(),
      dateTo: query.dateTo ?? this.today(),
      branchId: query.branchId ? Number(query.branchId) : undefined,
    });
  }

  @Get('reports/staff')
  @RequirePermission(Permission.ANALYTICS_READ)
  async getStaffReport(@Query() query: any) {
    return this.reportsQuery.getStaffReport({
      dateFrom: query.dateFrom ?? this.firstOfMonth(),
      dateTo: query.dateTo ?? this.today(),
      branchId: query.branchId ? Number(query.branchId) : undefined,
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
