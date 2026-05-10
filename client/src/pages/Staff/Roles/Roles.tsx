import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import Modal from '../../../components/ui/Modal';
import RolesTable from './RolesTable';
import usePageTitle from '../../../hooks/usePageTitle';
import {
  useGetRolesQuery,
  useDeleteRoleMutation,
  useDeleteRolesMutation,
} from '../../../store/api/rolesApi';
import type { Role } from '../../../types/auth';
import CreateRoleModal from './CreateRoleModal';
import EditRoleModal from './EditRoleModal';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';

function Roles() {
  usePageTitle('Roles');
  const navigate = useNavigate();

  const { showToast } = useToast();
  const { can } = useAuth();
  const canManage = can('role:manage');

  // RTK Query hooks
  const { data: roles = [], isLoading: loading } = useGetRolesQuery();
  const [deleteRole, { isLoading: deletingSingle }] = useDeleteRoleMutation();
  const [deleteRoles, { isLoading: deletingBulk }] = useDeleteRolesMutation();
  const deleting = deletingSingle || deletingBulk;

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [actionValue, setActionValue] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 6;

  // Modals
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Pagination calculations
  const totalPages = Math.ceil(roles.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, roles.length);
  const paginatedRoles = roles.slice(startIndex, endIndex);

  // Selection handlers
  const isAllSelected = paginatedRoles.length > 0 && paginatedRoles.every((r) => selectedIds.has(r.id));
  const isSomeSelected = paginatedRoles.some((r) => selectedIds.has(r.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const newSet = new Set(selectedIds);
      paginatedRoles.forEach((r) => newSet.delete(r.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      paginatedRoles.forEach((r) => newSet.add(r.id));
      setSelectedIds(newSet);
    }
  };

  const handleSelectRole = (roleId: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(roleId)) {
      newSelected.delete(roleId);
    } else {
      newSelected.add(roleId);
    }
    setSelectedIds(newSelected);
  };

  // Action handler
  const handleActionChange = (value: string) => {
    setActionValue(value);
    if (value === 'delete') {
      setBulkDeleteModalOpen(true);
    } else if (value === 'view-staff' && selectedIds.size === 1) {
      const roleId = Array.from(selectedIds)[0];
      navigate(`/staff?roleId=${roleId}`);
    } else if (value === 'edit' && selectedIds.size === 1) {
      const roleId = Array.from(selectedIds)[0];
      const role = roles.find((r) => r.id === roleId);
      if (role) {
        openEditModal(role);
      }
    }
  };

  const openEditModal = (role: Role) => {
    setRoleToEdit(role);
    setEditModalOpen(true);
    setActionValue('');
  };

  const handleRoleUpdated = () => {
    setRoleToEdit(null);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    try {
      await deleteRoles(Array.from(selectedIds)).unwrap();
      showToast('success', `${selectedIds.size} role${selectedIds.size > 1 ? 's' : ''} deleted successfully`);
      setSelectedIds(new Set());
      setBulkDeleteModalOpen(false);
      setActionValue('');
    } catch (error) {
      console.error('Failed to delete roles:', error);
    }
  };

  const handleSingleDelete = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete.id).unwrap();
      showToast('success', `Role "${roleToDelete.name}" deleted successfully`);
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      showToast('error', `Failed to delete role. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Failed to delete role:', error);
    }
  };

  const handleViewStaff = (roleId: number) => {
    navigate(`/staff?roleId=${roleId}`);
  };

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setDeleteModalOpen(true);
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

  if (loading) {
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link
              to="/staff"
              className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <i className="fa-solid fa-arrow-left" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              Manage Roles
            </h1>
          </div>
          {canManage && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium cursor-pointer text-sm sm:text-base"
            >
              <i className="fa-solid fa-plus" />
              <span className=" sm:inline">Add Role</span>
            </button>
          )}
        </div>

        {/* Filters / Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              {selectedIds.size > 0
                ? `${selectedIds.size} role${selectedIds.size > 1 ? 's' : ''} selected`
                : `${roles.length} role${roles.length !== 1 ? 's' : ''} total`}
            </p>

            {/* Actions Dropdown */}
            <div className="relative w-full sm:w-auto sm:min-w-[160px]">
              <select
                value={actionValue}
                onChange={(e) => handleActionChange(e.target.value)}
                disabled={selectedIds.size === 0}
                className="w-full appearance-none pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Actions</option>
                {canManage && selectedIds.size === 1 && (
                  <option value="edit">Edit Role</option>
                )}
                {selectedIds.size === 1 && (
                  <option value="view-staff">View Staff</option>
                )}
                {canManage && <option value="delete">Delete</option>}
              </select>
              <i className="fa-solid fa-sliders absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            </div>
          </div>
        </div>

        {/* Roles Table */}
        <RolesTable
          roles={paginatedRoles}
          selectedIds={selectedIds}
          onSelectRole={handleSelectRole}
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
          isSomeSelected={isSomeSelected}
          onEdit={openEditModal}
          onViewStaff={handleViewStaff}
          onDelete={handleDeleteRole}
          startIndex={startIndex}
          endIndex={endIndex}
          totalCount={roles.length}
        />

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-row items-center justify-between gap-4">
              {/* Previous */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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

              {/* Next */}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      <EditRoleModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setRoleToEdit(null);
        }}
        role={roleToEdit}
        onRoleUpdated={handleRoleUpdated}
      />

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={bulkDeleteModalOpen}
        onClose={() => {
          setBulkDeleteModalOpen(false);
          setActionValue('');
        }}
        title="Delete Roles"
        leftButton={{
          text: 'Cancel',
          onClick: () => {
            setBulkDeleteModalOpen(false);
            setActionValue('');
          },
          variant: 'secondary',
        }}
        rightButton={{
          text: deleting
            ? 'Deleting…'
            : `Delete ${selectedIds.size} Role${selectedIds.size > 1 ? 's' : ''}`,
          onClick: handleBulkDelete,
          variant: 'danger',
        }}
      >
        <p className="text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">
            {selectedIds.size} role{selectedIds.size > 1 ? 's' : ''}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>

      {/* Single Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
        title="Delete Role"
        leftButton={{
          text: 'Cancel',
          onClick: () => {
            setDeleteModalOpen(false);
            setRoleToDelete(null);
          },
          variant: 'secondary',
        }}
        rightButton={{
          text: deleting ? 'Deleting…' : 'Delete Role',
          onClick: handleSingleDelete,
          variant: 'danger',
        }}
      >
        <p className="text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">
            {roleToDelete?.name}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>

      {/* Add Role Modal */}
      <CreateRoleModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </Layout>
  );
}

export default Roles;