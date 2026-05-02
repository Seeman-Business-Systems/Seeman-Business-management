import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import IssueReportEntity from 'src/infrastructure/database/entities/issue-report.entity';
import { IssueReportService } from 'src/application/issue-report/issue-report.service';
import IssueReportController from 'src/presentation/http/controllers/issue-report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IssueReportEntity])],
  controllers: [IssueReportController],
  providers: [IssueReportService],
})
export class IssueReportModule {}
