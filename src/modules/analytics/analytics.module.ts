import { Module } from '@nestjs/common';
import AnalyticsSummaryQuery from 'src/application/analytics/analytics-summary.query';
import { ReportsQuery } from 'src/application/analytics/reports.query';
import AnalyticsController from 'src/presentation/http/controllers/analytics.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsSummaryQuery, ReportsQuery],
})
export class AnalyticsModule {}
