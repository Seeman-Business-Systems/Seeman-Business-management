import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import IssueReportEntity, {
  IssueStatus,
  IssuePriority,
  IssueType,
} from 'src/infrastructure/database/entities/issue-report.entity';

export interface CreateIssueDto {
  type: IssueType;
  subject: string;
  description: string;
  module?: string;
  submittedBy: number;
}

export interface UpdateIssueDto {
  status?: IssueStatus;
  priority?: IssuePriority;
  adminNote?: string;
  resolvedBy?: number;
}

@Injectable()
export class IssueReportService {
  constructor(
    @InjectRepository(IssueReportEntity)
    private readonly repo: Repository<IssueReportEntity>,
  ) {}

  async create(dto: CreateIssueDto): Promise<IssueReportEntity> {
    const issue = this.repo.create({
      type: dto.type,
      subject: dto.subject,
      description: dto.description,
      module: dto.module ?? null,
      submittedBy: dto.submittedBy,
      status: IssueStatus.OPEN,
      priority: IssuePriority.MEDIUM,
    });
    return this.repo.save(issue);
  }

  async findAll(filters: { status?: IssueStatus; type?: IssueType; priority?: IssuePriority }) {
    const qb = this.repo
      .createQueryBuilder('ir')
      .leftJoin('ir.submitter', 'submitter')
      .leftJoin('ir.resolver', 'resolver')
      .addSelect([
        'submitter.id',
        'submitter.firstName',
        'submitter.lastName',
        'resolver.id',
        'resolver.firstName',
        'resolver.lastName',
      ])
      .orderBy('ir.createdAt', 'DESC');

    if (filters.status) qb.andWhere('ir.status = :status', { status: filters.status });
    if (filters.type) qb.andWhere('ir.type = :type', { type: filters.type });
    if (filters.priority) qb.andWhere('ir.priority = :priority', { priority: filters.priority });

    const rows = await qb.getMany();
    return rows.map((r) => this.serialise(r));
  }

  async findByStaff(staffId: number) {
    const rows = await this.repo.find({
      where: { submittedBy: staffId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => this.serialise(r));
  }

  async update(id: number, dto: UpdateIssueDto, adminId: number): Promise<IssueReportEntity> {
    const issue = await this.repo.findOne({ where: { id } });
    if (!issue) throw new NotFoundException('Issue not found');

    if (dto.status) issue.status = dto.status;
    if (dto.priority) issue.priority = dto.priority;
    if (dto.adminNote !== undefined) issue.adminNote = dto.adminNote;

    if (dto.status === IssueStatus.RESOLVED) {
      issue.resolvedBy = adminId;
    }

    return this.repo.save(issue);
  }

  private serialise(r: IssueReportEntity) {
    return {
      id: r.id,
      type: r.type,
      subject: r.subject,
      description: r.description,
      module: r.module,
      status: r.status,
      priority: r.priority,
      adminNote: r.adminNote,
      submittedBy: r.submittedBy,
      submitterName: r.submitter
        ? `${r.submitter.firstName} ${r.submitter.lastName}`
        : null,
      resolvedBy: r.resolvedBy,
      resolverName: r.resolver
        ? `${r.resolver.firstName} ${r.resolver.lastName}`
        : null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
