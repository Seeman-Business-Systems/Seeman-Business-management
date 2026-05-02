import { Module } from '@nestjs/common';
import AnalyticsSummaryQuery from 'src/application/analytics/analytics-summary.query';
import { ReportsQuery } from 'src/application/analytics/reports.query';
import AnalyticsController from 'src/presentation/http/controllers/analytics.controller';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsSummaryQuery, ReportsQuery],
})
export class AnalyticsModule {}
