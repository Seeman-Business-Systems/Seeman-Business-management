import { baseApi } from './baseApi';
import type {
  IssueReport,
  CreateIssueReportRequest,
  UpdateIssueReportRequest,
  IssueStatus,
  IssueType,
  IssuePriority,
} from '../../types/issueReport';

export const issueReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyIssues: builder.query<IssueReport[], void>({
      query: () => '/issue-reports/mine',
      providesTags: ['IssueReports'],
    }),
    getAllIssues: builder.query<IssueReport[], { status?: IssueStatus; type?: IssueType; priority?: IssuePriority }>({
      query: ({ status, type, priority } = {}) => {
        const p = new URLSearchParams();
        if (status) p.append('status', status);
        if (type) p.append('type', type);
        if (priority) p.append('priority', priority);
        const qs = p.toString();
        return `/issue-reports${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['IssueReports'],
    }),
    createIssue: builder.mutation<IssueReport, CreateIssueReportRequest>({
      query: (body) => ({ url: '/issue-reports', method: 'POST', body }),
      invalidatesTags: ['IssueReports'],
    }),
    updateIssue: builder.mutation<IssueReport, { id: number; data: UpdateIssueReportRequest }>({
      query: ({ id, data }) => ({ url: `/issue-reports/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['IssueReports'],
    }),
  }),
});

export const {
  useGetMyIssuesQuery,
  useGetAllIssuesQuery,
  useCreateIssueMutation,
  useUpdateIssueMutation,
} = issueReportsApi;
