import { Module } from '@nestjs/common';
import AnalyticsSummaryQuery from 'src/application/analytics/analytics-summary.query';
import AnalyticsController from 'src/presentation/http/controllers/analytics.controller';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsSummaryQuery],
})
export class AnalyticsModule {}
