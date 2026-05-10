import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import usePageTitle from '../../hooks/usePageTitle';
import {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from '../../store/api/expensesApi';
import { useGetBranchesQuery } from '../../store/api/branchesApi';
import { useToast } from '../../context/ToastContext';
import { EXPENSE_CATEGORY_LABELS } from '../../types/expense';
import type {
  ExpenseCategory,
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from '../../types/expense';

const CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  RENT: 'bg-blue-100 text-blue-800',
  UTILITIES: 'bg-cyan-100 text-cyan-800',
  SALARIES: 'bg-indigo-100 text-indigo-800',
  WAYBILLFEES: 'bg-orange-100 text-orange-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  MISCELLANEOUS: 'bg-gray-100 text-gray-700',
  FEEDING: 'bg-green-100 text-green-800',
  DAILY_TRANSPORT: 'bg-purple-100 text-purple-800',
  WORKERS_PAYMENT: 'bg-pink-100 text-pink-800',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const emptyForm: CreateExpenseRequest = {
  amount: 0,
  category: 'MISCELLANEOUS',
  description: '',
  branchId: 0,
  date: new Date().toISOString().split('T')[0],
  notes: '',
};

function Expenses() {
  usePageTitle('Expenses');
  const { showToast } = useToast();
  const { user, can } = useAuth();
  const isGlobalView = can('filter:by-branch');

  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') ?? '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') ?? '');

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBranch, selectedCategory, dateFrom, dateTo]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateExpenseRequest>(() => ({
    ...emptyForm,
    branchId: user?.branch?.id ?? 0,
  }));
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setShowCreateModal(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openCreateModal = () => {
    setForm({ ...emptyForm, branchId: user?.branch?.id ?? 0 });
    setShowCreateModal(true);
  };

  const { data, isLoading, isFetching } = useGetExpensesQuery({
    branchId: selectedBranch ? Number(selectedBranch) : undefined,
    category: (selectedCategory as ExpenseCategory) || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    take: pageSize,
    skip: (currentPage - 1) * pageSize,
  });

  const { data: branches = [] } = useGetBranchesQuery();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState<UpdateExpenseRequest>({
    amount: 0, category: 'MISCELLANEOUS', description: '', branchId: 0, date: '', notes: '',
  });

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setEditForm({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      branchId: expense.branchId,
      date: expense.date.split('T')[0],
      notes: expense.notes ?? '',
    });
  };

  const handleUpdate = async () => {
    if (!editingExpense || !editForm.amount || !editForm.branchId) return;
    try {
      await updateExpense({ id: editingExpense.id, data: { ...editForm, notes: editForm.notes || undefined } }).unwrap();
      setEditingExpense(null);
      showToast('success', 'Expense updated');
    } catch {
      showToast('error', 'Failed to update expense');
    }
  };

  const expenses = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleCreate = async () => {
    if (!form.amount || !form.branchId) return;
    try {
      await createExpense({ ...form, notes: form.notes || undefined }).unwrap();
      setShowCreateModal(false);
      setForm(emptyForm);
      showToast('success', 'Expense recorded');
    } catch {
      showToast('error', 'Failed to record expense');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteExpense(pendingDelete).unwrap();
      setPendingDelete(null);
      showToast('success', 'Expense deleted');
    } catch {
      showToast('error', 'Failed to delete expense');
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Expenses
          </h1>
          {can('expense:create') && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <i className="fa-solid fa-plus" />
              Record Expense
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3">
            {/* Branch — only visible to roles with filter:by-branch; backend enforces scoping otherwise */}
            {isGlobalView && (
              <div className="relative min-w-[150px] flex-1">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                >
                  <option value="">All branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <i className="fa-solid fa-building absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
              </div>
            )}
            {/* Category */}
            <div className="relative min-w-[150px] flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {EXPENSE_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-tag absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            </div>
            {/* Dates */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {(selectedBranch || selectedCategory || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setSelectedBranch('');
                  setSelectedCategory('');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <i className="fa-solid fa-money-bill-trend-up text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500 font-medium">No expenses found</p>
              <p className="text-sm text-gray-400 mt-1">
                Record your first expense to get started.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {total > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, total)} of {total} expenses
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Results per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="appearance-none px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              {/* Desktop */}
              <div
                className={`hidden md:block overflow-x-auto ${isFetching ? 'opacity-60' : ''}`}
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recorded By
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="w-10 px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expenses.map((expense, i) => (
                      <tr
                        key={expense.id}
                        className={`hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-indigo-50/20' : ''}`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 font-medium">
                            {expense.description}
                          </p>
                          {expense.notes && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {expense.notes}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[expense.category]}`}
                          >
                            {EXPENSE_CATEGORY_LABELS[expense.category]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {expense.branchName ?? '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {expense.recordedByName ?? '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(expense)}
                              className="text-gray-300 hover:text-indigo-500 transition-colors cursor-pointer"
                            >
                              <i className="fa-solid fa-pen text-sm" />
                            </button>
                            <button
                              onClick={() => setPendingDelete(expense.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <i className="fa-solid fa-trash text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200 bg-gray-50">
                      <td
                        colSpan={5}
                        className="px-6 py-3 text-sm font-semibold text-gray-700"
                      >
                        Total ({total} expense{total !== 1 ? 's' : ''})
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(totalAmount)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {expenses.map((expense) => (
                  <div key={expense.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {expense.branchName} · {formatDate(expense.date)}
                        </p>
                        {expense.recordedByName && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            By {expense.recordedByName}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[expense.category]}`}
                        >
                          {EXPENSE_CATEGORY_LABELS[expense.category]}
                        </span>
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => openEditModal(expense)} className="text-gray-400 hover:text-indigo-500 cursor-pointer">
                            <i className="fa-solid fa-pen text-xs" />
                          </button>
                          <button onClick={() => setPendingDelete(expense.id)} className="text-gray-400 hover:text-red-500 cursor-pointer">
                            <i className="fa-solid fa-trash text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-arrow-left" /> Previous
              </button>
              <div className="flex items-center gap-1">
                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else if (currentPage <= 3) {
                    pages.push(1, 2, 3, 4, '...', totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                  }
                  return pages.map((page, i) =>
                    typeof page === 'number' ? (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={i} className="px-2 text-gray-400">{page}</span>
                    )
                  );
                })()}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setForm(emptyForm);
        }}
        title="Record Expense"
        leftButton={{
          text: 'Cancel',
          onClick: () => {
            setShowCreateModal(false);
            setForm(emptyForm);
          },
          variant: 'secondary',
        }}
        rightButton={{
          text: isCreating ? 'Saving…' : 'Record Expense',
          onClick: handleCreate,
          variant: 'primary',
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.amount === 0 ? '' : form.amount.toLocaleString('en-NG')}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/,/g, ''));
                  if (!isNaN(n)) setForm((f) => ({ ...f, amount: n }));
                }}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value as ExpenseCategory,
                }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {EXPENSE_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          {can('branch:select-on-create') ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                value={form.branchId || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, branchId: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select branch…</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            user?.branch && (
              <p className="text-xs text-gray-500">
                Branch: <span className="font-medium text-gray-700">{user.branch.name}</span>
              </p>
            )
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="e.g. Monthly office rent"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
              placeholder="Any additional details…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={editingExpense !== null}
        onClose={() => setEditingExpense(null)}
        title="Edit Expense"
        leftButton={{ text: 'Cancel', onClick: () => setEditingExpense(null), variant: 'secondary' }}
        rightButton={{ text: isUpdating ? 'Saving…' : 'Save Changes', onClick: handleUpdate, variant: 'primary' }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) <span className="text-red-500">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                value={editForm.amount === 0 ? '' : editForm.amount.toLocaleString('en-NG')}
                onChange={(e) => { const n = Number(e.target.value.replace(/,/g, '')); if (!isNaN(n)) setEditForm((f) => ({ ...f, amount: n })); }}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
            <select
              value={editForm.category}
              onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch <span className="text-red-500">*</span></label>
            <select
              value={editForm.branchId || ''}
              onChange={(e) => setEditForm((f) => ({ ...f, branchId: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select branch…</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Monthly office rent"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete Expense"
        leftButton={{
          text: 'Cancel',
          onClick: () => setPendingDelete(null),
          variant: 'secondary',
        }}
        rightButton={{
          text: isDeleting ? 'Deleting…' : 'Delete',
          onClick: handleDelete,
          variant: 'danger',
        }}
      >
        <p className="text-gray-600">
          Are you sure you want to delete this expense? This cannot be undone.
        </p>
      </Modal>
    </Layout>
  );
}

export default Expenses;
