import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import BranchesTable from './BranchesTable';
import usePageTitle from '../../hooks/usePageTitle';
import useDebounce from '../../hooks/useDebounce';
import { BranchStatus } from '../../types/auth';
import {
  useGetBranchesPaginatedQuery,
  useDeleteBranchesMutation,
} from '../../store/api/branchesApi';
import { useToast } from '../../context/ToastContext';

function Branches() {
  usePageTitle('Branches');

  const { showToast } = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [actionValue, setActionValue] = useState('');

  // Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(6);

  // RTK Query
  const skip = (currentPage - 1) * resultsPerPage;
  const { data, isLoading: loading, isFetching } = useGetBranchesPaginatedQuery({
    search: debouncedSearch || undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    city: selectedCity !== 'all' ? selectedCity : undefined,
    skip,
    take: resultsPerPage,
  });

  const [deleteBranches, { isLoading: isDeleting }] = useDeleteBranchesMutation();

  const branches = data?.data || [];
  const total = data?.total || 0;

  // Get unique cities for filter dropdown
  const cities = useMemo(() => {
    const citySet = new Set(branches.map((b) => b.city));
    return Array.from(citySet).sort();
  }, [branches]);

  // Reset to first page when filters change (not pagination)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedStatus, selectedCity, resultsPerPage]);

  // Pagination calculations
  const totalPages = Math.ceil(total / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, total);

  // Selection handlers
  const isAllSelected = branches.length > 0 && branches.every((b) => selectedIds.has(b.id));
  const isSomeSelected = branches.some((b) => selectedIds.has(b.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const newSet = new Set(selectedIds);
      branches.forEach((b) => newSet.delete(b.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      branches.forEach((b) => newSet.add(b.id));
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

  // Single delete handler (from context menu)
  const handleSingleDelete = (id: number) => {
    setSingleDeleteId(id);
    setShowDeleteModal(true);
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    const idsToDelete = singleDeleteId ? [singleDeleteId] : Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    try {
      await deleteBranches(idsToDelete).unwrap();
      showToast('success', `${idsToDelete.length} branch${idsToDelete.length > 1 ? 'es' : ''} deleted successfully`);
      setSelectedIds(new Set());
      setSingleDeleteId(null);
      setActionValue('');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete branches:', error);
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

  if (loading && branches.length === 0) {
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Branches</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/branches/new"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
            >
              <i className="fa-solid fa-plus" />
              <span>Add Branch</span>
            </Link>
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
                placeholder="Search branches"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              />
              {isFetching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>

            {/* Filters row - wraps on mobile */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Status Filter */}
              <div className="relative flex-1 min-w-[130px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="all">All statuses</option>
                  <option value={BranchStatus.ACTIVE}>Active</option>
                  <option value={BranchStatus.INACTIVE}>Inactive</option>
                  <option value={BranchStatus.SUSPENDED}>Suspended</option>
                </select>
                <i className="fa-solid fa-circle-check absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* City Filter */}
              <div className="relative flex-1 min-w-[130px]">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="all">All cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <i className="fa-solid fa-location-dot absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
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

        {/* Branches Table */}
        <BranchesTable
          branches={branches}
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
          onDelete={handleSingleDelete}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
          setSingleDeleteId(null);
          setActionValue('');
        }}
        title="Delete Branch"
        leftButton={{
          text: 'Cancel',
          onClick: () => {
            setShowDeleteModal(false);
            setSingleDeleteId(null);
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
          {singleDeleteId ? (
            <>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">
                {branches.find((b) => b.id === singleDeleteId)?.name}
              </span>
              ? This action cannot be undone.
            </>
          ) : (
            <>
              Are you sure you want to delete {selectedIds.size} branch
              {selectedIds.size > 1 ? 'es' : ''}? This action cannot be undone.
            </>
          )}
        </p>
      </Modal>
    </Layout>
  );
}

export default Branches;
