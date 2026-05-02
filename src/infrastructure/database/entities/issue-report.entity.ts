import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import StaffEntity from './staff.entity';

export enum IssueType {
  BUG = 'BUG',
  WRONG_DATA = 'WRONG_DATA',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  OTHER = 'OTHER',
}

export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export enum IssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity({ name: 'issue_reports' })
class IssueReportEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: IssueType })
  type: IssueType;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  module: string | null;

  @Column({ type: 'enum', enum: IssueStatus, default: IssueStatus.OPEN })
  status: IssueStatus;

  @Column({ type: 'enum', enum: IssuePriority, default: IssuePriority.MEDIUM })
  priority: IssuePriority;

  @Column({ name: 'submitted_by' })
  submittedBy: number;

  @ManyToOne(() => StaffEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'submitted_by' })
  submitter: StaffEntity;

  @Column({ type: 'int', name: 'resolved_by', nullable: true })
  resolvedBy: number | null;

  @ManyToOne(() => StaffEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolved_by' })
  resolver: StaffEntity | null;

  @Column({ name: 'admin_note', type: 'text', nullable: true })
  adminNote: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export default IssueReportEntity;
