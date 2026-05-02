import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import JwtAuthGuard from 'src/modules/auth/guards/jwt-auth.guard';
import { IssueReportService } from 'src/application/issue-report/issue-report.service';
import { IssueStatus, IssuePriority, IssueType } from 'src/infrastructure/database/entities/issue-report.entity';
import { RequirePermission } from 'src/modules/auth/decorators/role-guard.decorator';
import { Permission } from 'src/domain/permission/permission';
import type { UpdateIssueDto } from 'src/application/issue-report/issue-report.service';

@Controller('issue-reports')
@UseGuards(JwtAuthGuard)
class IssueReportController {
  constructor(private readonly service: IssueReportService) {}

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    return this.service.create({
      type: body.type as IssueType,
      subject: body.subject,
      description: body.description,
      module: body.module,
      submittedBy: req.user.id,
    });
  }

  @Get('mine')
  async getMine(@Request() req: any) {
    return this.service.findByStaff(req.user.id);
  }

  @Get()
  @RequirePermission(Permission.SETTINGS_MANAGE)
  async getAll(@Query() query: any) {
    return this.service.findAll({
      status: query.status as IssueStatus | undefined,
      type: query.type as IssueType | undefined,
      priority: query.priority as IssuePriority | undefined,
    });
  }

  @Patch(':id')
  @RequirePermission(Permission.SETTINGS_MANAGE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateIssueDto,
    @Request() req: any,
  ) {
    return this.service.update(id, body, req.user.id);
  }
}

export default IssueReportController;
