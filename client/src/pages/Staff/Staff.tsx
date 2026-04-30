import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import StaffTable from './StaffTable';
import usePageTitle from '../../hooks/usePageTitle';
import useDebounce from '../../hooks/useDebounce';
import useRoles from '../../hooks/useRoles';
import useBranches from '../../hooks/useBranches';
import api from '../../lib/api';
import type { Staff as StaffType } from '../../types/auth';

interface PaginatedResponse {
  data: StaffType[];
  total: number;
  skip: number;
  take: number;
}

function Staff() {
  usePageTitle('Staff');
  const { can } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [staff, setStaff] = useState<StaffType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { branches } = useBranches();
  const { roles } = useRoles();

  // Filters - read roleId and branchId from URL params if present
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedRole, setSelectedRole] = useState<string>(searchParams.get('roleId') || 'all');
  const [selectedBranch, setSelectedBranch] = useState<string>(searchParams.get('branchId') || 'all');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [actionValue, setActionValue] = useState('');

  // Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(6);

  // Fetch staff with filters
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }
      if (selectedRole !== 'all') {
        params.append('roleId', selectedRole);
      }
      if (selectedBranch !== 'all') {
        params.append('branchId', selectedBranch);
      }

      // Pagination
      const skip = (currentPage - 1) * resultsPerPage;
      params.append('skip', skip.toString());
      params.append('take', resultsPerPage.toString());

      const response = await api.get<PaginatedResponse>(`/staff?${params.toString()}`);
      setStaff(Array.isArray(response.data.data) ? response.data.data : []);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedRole, selectedBranch, currentPage, resultsPerPage]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Reset to first page when filters change (not pagination)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedRole, selectedBranch, resultsPerPage]);

  // Sync filters with URL
  useEffect(() => {
    setSearchParams((prev) => {
      if (selectedRole === 'all') {
        prev.delete('roleId');
      } else {
        prev.set('roleId', selectedRole);
      }
      if (selectedBranch === 'all') {
        prev.delete('branchId');
      } else {
        prev.set('branchId', selectedBranch);
      }
      return prev;
    }, { replace: true });
  }, [selectedRole, selectedBranch, setSearchParams]);

  // Pagination calculations
  const totalPages = Math.ceil(total / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, total);

  // Selection handlers
  const isAllSelected = staff.length > 0 && staff.every((m) => selectedIds.has(m.id));
  const isSomeSelected = staff.some((m) => selectedIds.has(m.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const newSet = new Set(selectedIds);
      staff.forEach((m) => newSet.delete(m.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      staff.forEach((m) => newSet.add(m.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelectOne = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (selectedIds.size === 0) return;

    setIsDeleting(true);
    try {
      await api.delete('/staff', { data: { ids: Array.from(selectedIds) } });
      setSelectedIds(new Set());
      setActionValue('');
      setShowDeleteModal(false);
      fetchStaff();
    } catch (error) {
      console.error('Failed to delete staff:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Action handler
  const handleActionChange = (value: string) => {
    setActionValue(value);
    if (value === 'delete') {
      setShowDeleteModal(true);
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (loading && staff.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Staff</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/staff/roles/manage"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm sm:text-base"
            >
              <i className="fa-solid fa-user-gear" />
              <span className="hidden sm:inline">Manage Roles</span>
              <span className="sm:hidden">Manage Roles</span>
            </Link>
            {can('staff:create') && (
              <Link
                to="/staff/new"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
              >
                <i className="fa-solid fa-plus" />
                <span className="sm:inline">Add Staff</span>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            {/* Search - full width on mobile */}
            <div className="relative w-full">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search member"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              />
            </div>

            {/* Filters row - wraps on mobile */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Role Filter */}
              <div className="relative flex-1 min-w-[130px]">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="all">All staff</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id.toString()}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <i className="fa-solid fa-users absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* Branch Filter */}
              <div className="relative flex-1 min-w-[130px]">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="all">All branches</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <i className="fa-solid fa-code-branch absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* Actions Dropdown */}
              <div className="relative flex-1 min-w-[130px]">
                <select
                  value={actionValue}
                  onChange={(e) => handleActionChange(e.target.value)}
                  disabled={selectedIds.size === 0}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Actions</option>
                  <option value="delete">Delete</option>
                </select>
                <i className="fa-solid fa-sliders absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <StaffTable
          staff={staff}
          selectedIds={selectedIds}
          onSelectOne={toggleSelectOne}
          onSelectAll={toggleSelectAll}
          isAllSelected={isAllSelected}
          isSomeSelected={isSomeSelected}
          startIndex={startIndex}
          endIndex={endIndex}
          total={total}
          resultsPerPage={resultsPerPage}
          onResultsPerPageChange={setResultsPerPage}
        />
        {/* Pagination */}
        {totalPages > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-row items-center justify-between gap-4">
              {/* Previous button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-arrow-left" />
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) =>
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-gray-400">
                      {page}
                    </span>
                  ),
                )}
              </div>

              {/* Next button */}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setActionValue('');
        }}
        title="Delete Staff"
        leftButton={{
          text: 'Cancel',
          onClick: () => {
            setShowDeleteModal(false);
            setActionValue('');
          },
          variant: 'secondary',
        }}
        rightButton={{
          text: isDeleting ? 'Deleting…' : 'Delete',
          onClick: handleDeleteConfirm,
          variant: 'danger',
        }}
      >
        <p className="text-gray-600">
          Are you sure you want to delete {selectedIds.size} staff member
          {selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.
        </p>
      </Modal>
    </Layout>
  );
}

export default Staff;