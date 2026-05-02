export type IssueType = 'BUG' | 'WRONG_DATA' | 'FEATURE_REQUEST' | 'OTHER';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH';

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  BUG: 'Bug',
  WRONG_DATA: 'Wrong Data',
  FEATURE_REQUEST: 'Feature Request',
  OTHER: 'Other',
};

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};

export const ISSUE_PRIORITY_LABELS: Record<IssuePriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export interface IssueReport {
  id: number;
  type: IssueType;
  subject: string;
  description: string;
  module: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  adminNote: string | null;
  submittedBy: number;
  submitterName: string | null;
  resolvedBy: number | null;
  resolverName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueReportRequest {
  type: IssueType;
  subject: string;
  description: string;
  module?: string;
}

export interface UpdateIssueReportRequest {
  status?: IssueStatus;
  priority?: IssuePriority;
  adminNote?: string;
}
