import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import usePageTitle from '../../hooks/usePageTitle';
import Modal from '../../components/ui/Modal';
import {
  useGetMyIssuesQuery,
  useGetAllIssuesQuery,
  useCreateIssueMutation,
  useUpdateIssueMutation,
} from '../../store/api/issueReportsApi';
import type {
  IssueType,
  IssueStatus,
  IssuePriority,
  IssueReport,
  CreateIssueReportRequest,
  UpdateIssueReportRequest,
} from '../../types/issueReport';
import {
  ISSUE_TYPE_LABELS,
  ISSUE_STATUS_LABELS,
  ISSUE_PRIORITY_LABELS,
} from '../../types/issueReport';

type Tab = 'submit' | 'mine' | 'all';

const ISSUE_TYPES = Object.keys(ISSUE_TYPE_LABELS) as IssueType[];
const ISSUE_STATUSES = Object.keys(ISSUE_STATUS_LABELS) as IssueStatus[];
const ISSUE_PRIORITIES = Object.keys(ISSUE_PRIORITY_LABELS) as IssuePriority[];

const MODULE_FROM_PATH: Record<string, string> = {
  '/': 'Dashboard',
  '/sales': 'Sales',
  '/expenses': 'Expenses',
  '/inventory': 'Inventory',
  '/products': 'Products',
  '/supplies': 'Supplies',
  '/customers': 'Customers',
  '/staff': 'Staff',
  '/branches': 'Branches',
  '/warehouses': 'Warehouses',
  '/reports': 'Reports',
  '/activities': 'Activities',
};

const STATUS_STYLES: Record<IssueStatus, string> = {
  OPEN: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
};

const PRIORITY_STYLES: Record<IssuePriority, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-rose-100 text-rose-700',
};

const TYPE_ICONS: Record<IssueType, string> = {
  BUG: 'fa-bug',
  WRONG_DATA: 'fa-triangle-exclamation',
  FEATURE_REQUEST: 'fa-lightbulb',
  OTHER: 'fa-circle-info',
};

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function IssueCard({ issue, onUpdate, isAdmin }: {
  issue: IssueReport;
  onUpdate?: (issue: IssueReport) => void;
  isAdmin?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className={`fa-solid ${TYPE_ICONS[issue.type]} text-sm text-indigo-600`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{issue.subject}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {ISSUE_TYPE_LABELS[issue.type]}
              {issue.module ? ` · ${issue.module}` : ''}
              {isAdmin && issue.submitterName ? ` · by ${issue.submitterName}` : ''}
              {' · '}{fmtDate(issue.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[issue.priority]}`}>
            {ISSUE_PRIORITY_LABELS[issue.priority]}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[issue.status]}`}>
            {ISSUE_STATUS_LABELS[issue.status]}
          </span>
          {isAdmin && onUpdate && (
            <button
              onClick={() => onUpdate(issue)}
              className="text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer ml-1"
            >
              <i className="fa-solid fa-pen text-sm" />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-3 leading-relaxed">{issue.description}</p>

      {issue.adminNote && (
        <div className="mt-3 bg-indigo-50 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-indigo-700 mb-1">Admin note</p>
          <p className="text-sm text-indigo-800">{issue.adminNote}</p>
          {issue.resolverName && (
            <p className="text-xs text-indigo-500 mt-1">— {issue.resolverName}</p>
          )}
        </div>
      )}
    </div>
  );
}

const emptyForm: CreateIssueReportRequest = {
  type: 'BUG',
  subject: '',
  description: '',
  module: '',
};

function ReportIssue() {
  usePageTitle('Report Issue');
  const { user, can } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const isAdmin = can('settings:manage');

  const detectedModule = Object.entries(MODULE_FROM_PATH).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path),
  )?.[1] ?? '';

  const [tab, setTab] = useState<Tab>('submit');
  const [form, setForm] = useState<CreateIssueReportRequest>({
    ...emptyForm,
    module: detectedModule,
  });
  const [submitted, setSubmitted] = useState(false);

  // Admin filter state
  const [filterStatus, setFilterStatus] = useState<IssueStatus | ''>('');
  const [filterType, setFilterType] = useState<IssueType | ''>('');
  const [filterPriority, setFilterPriority] = useState<IssuePriority | ''>('');

  // Admin update modal
  const [editingIssue, setEditingIssue] = useState<IssueReport | null>(null);
  const [editForm, setEditForm] = useState<UpdateIssueReportRequest>({});

  const { data: myIssues = [], isLoading: myLoading } = useGetMyIssuesQuery(undefined, { skip: tab !== 'mine' });
  const { data: allIssues = [], isLoading: allLoading } = useGetAllIssuesQuery(
    { status: filterStatus || undefined, type: filterType || undefined, priority: filterPriority || undefined },
    { skip: !isAdmin || tab !== 'all' },
  );

  const [createIssue, { isLoading: isCreating }] = useCreateIssueMutation();
  const [updateIssue, { isLoading: isUpdating }] = useUpdateIssueMutation();

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    try {
      await createIssue({ ...form, module: form.module || undefined }).unwrap();
      setSubmitted(true);
      setForm({ ...emptyForm, module: detectedModule });
    } catch {
      showToast('error', 'Failed to submit issue');
    }
  };

  const openEdit = (issue: IssueReport) => {
    setEditingIssue(issue);
    setEditForm({
      status: issue.status,
      priority: issue.priority,
      adminNote: issue.adminNote ?? '',
    });
  };

  const handleUpdate = async () => {
    if (!editingIssue) return;
    try {
      await updateIssue({ id: editingIssue.id, data: editForm }).unwrap();
      setEditingIssue(null);
      showToast('success', 'Issue updated');
    } catch {
      showToast('error', 'Failed to update issue');
    }
  };

  const openIssues = (isAdmin ? allIssues : myIssues).filter((i) => i.status !== 'RESOLVED').length;

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: 'submit', label: 'Submit Issue', show: true },
    { key: 'mine', label: 'My Reports', show: true },
    { key: 'all', label: `All Issues${openIssues && tab === 'all' ? ` (${openIssues})` : ''}`, show: isAdmin },
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Flag something broken, wrong, or request a feature.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.filter((t) => t.show).map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSubmitted(false); }}
                className={`px-5 py-3.5 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                  tab === t.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* SUBMIT TAB */}
        {tab === 'submit' && (
          submitted ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-14 px-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                <i className="fa-solid fa-circle-check text-emerald-500 text-2xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Issue submitted</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                Thanks for reporting. You can track progress under <strong>My Reports</strong>.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-plus" />
                Report Another
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Issue Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ISSUE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm((f) => ({ ...f, type }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                        form.type === type
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <i className={`fa-solid ${TYPE_ICONS[type]} text-xs`} />
                      {ISSUE_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Brief summary of the issue"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe what happened and what you expected…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Module */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Module <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={form.module}
                  onChange={(e) => setForm((f) => ({ ...f, module: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select module…</option>
                  {Object.values(MODULE_FROM_PATH).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Submitted by */}
              <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center gap-2">
                <i className="fa-solid fa-user text-gray-400 text-xs" />
                <p className="text-sm text-gray-600">
                  Submitting as <span className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</span>
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isCreating || !form.subject.trim() || !form.description.trim()}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isCreating ? 'Submitting…' : 'Submit Issue'}
              </button>
            </div>
          )
        )}

        {/* MY REPORTS TAB */}
        {tab === 'mine' && (
          <div className="space-y-3">
            {myLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
              </div>
            ) : myIssues.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="fa-solid fa-bug text-gray-400 text-lg" />
                </div>
                <p className="text-gray-500 font-medium">No issues reported yet</p>
                <p className="text-sm text-gray-400 mt-1">Submit an issue and track it here.</p>
              </div>
            ) : (
              myIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))
            )}
          </div>
        )}

        {/* ALL ISSUES TAB (admin) */}
        {tab === 'all' && isAdmin && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as IssueStatus | '')}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  {ISSUE_STATUSES.map((s) => (
                    <option key={s} value={s}>{ISSUE_STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as IssueType | '')}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Types</option>
                  {ISSUE_TYPES.map((t) => (
                    <option key={t} value={t}>{ISSUE_TYPE_LABELS[t]}</option>
                  ))}
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as IssuePriority | '')}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Priorities</option>
                  {ISSUE_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{ISSUE_PRIORITY_LABELS[p]}</option>
                  ))}
                </select>
                {(filterStatus || filterType || filterPriority) && (
                  <button
                    onClick={() => { setFilterStatus(''); setFilterType(''); setFilterPriority(''); }}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Count */}
            <p className="text-sm text-gray-500">{allIssues.length} issue{allIssues.length !== 1 ? 's' : ''}</p>

            {allLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
              </div>
            ) : allIssues.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="fa-solid fa-circle-check text-gray-400 text-lg" />
                </div>
                <p className="text-gray-500 font-medium">No issues found</p>
              </div>
            ) : (
              allIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} onUpdate={openEdit} isAdmin />
              ))
            )}
          </div>
        )}
      </div>

      {/* Admin edit modal */}
      <Modal
        isOpen={editingIssue !== null}
        onClose={() => setEditingIssue(null)}
        title="Update Issue"
        leftButton={{ text: 'Cancel', onClick: () => setEditingIssue(null), variant: 'secondary' }}
        rightButton={{ text: isUpdating ? 'Saving…' : 'Save Changes', onClick: handleUpdate, variant: 'primary' }}
      >
        {editingIssue && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">{editingIssue.subject}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {ISSUE_TYPE_LABELS[editingIssue.type]}
                {editingIssue.submitterName ? ` · by ${editingIssue.submitterName}` : ''}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as IssueStatus }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ISSUE_STATUSES.map((s) => (
                    <option key={s} value={s}>{ISSUE_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={editForm.priority ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value as IssuePriority }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ISSUE_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{ISSUE_PRIORITY_LABELS[p]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={editForm.adminNote ?? ''}
                onChange={(e) => setEditForm((f) => ({ ...f, adminNote: e.target.value }))}
                rows={3}
                placeholder="Add a note for the staff member…"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}

export default ReportIssue;
