import { useRef, useState, useEffect } from 'react';
import type { Role, BaseStaff } from '../../../types/auth';

interface RolesTableProps {
  roles: Role[];
  selectedIds: Set<number>;
  onSelectRole: (roleId: number) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onEdit: (role: Role) => void;
  onViewStaff: (roleId: number) => void;
  onDelete: (role: Role) => void;
  startIndex: number;
  endIndex: number;
  totalCount: number;
}

function RolesTable({
  roles,
  selectedIds,
  onSelectRole,
  onSelectAll,
  isAllSelected,
  isSomeSelected,
  onEdit,
  onViewStaff,
  onDelete,
  startIndex,
  endIndex,
  totalCount,
}: RolesTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCreatedBy = (createdBy: BaseStaff | string | null) => {
    if (!createdBy) return 'System Actor';
    if (typeof createdBy === 'string') return createdBy;
    return `${createdBy.firstName} ${createdBy.lastName}`;
  };

  const openRowMenu = (e: React.MouseEvent, roleId: number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === roleId ? null : roleId);
  };

  const handleEdit = (role: Role) => {
    setOpenMenuId(null);
    onEdit(role);
  };

  const handleViewStaff = (roleId: number) => {
    setOpenMenuId(null);
    onViewStaff(roleId);
  };

  const handleDelete = (role: Role) => {
    setOpenMenuId(null);
    onDelete(role);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Results count */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {totalCount > 0 ? startIndex + 1 : 0} - {endIndex} of{' '}
          {totalCount} roles
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {roles.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            No roles found
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`p-4 ${selectedIds.has(role.id) ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(role.id)}
                      onChange={() => onSelectRole(role.id)}
                      className="w-4 h-4 mt-1 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">{role.name}</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            role.isManagement
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {role.isManagement ? 'Management' : 'Standard'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Created by {formatCreatedBy(role.createdBy)}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {formatDate(role.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0" ref={openMenuId === role.id ? menuRef : null}>
                    <button
                      onClick={(e) => openRowMenu(e, role.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <i className="fa-solid fa-ellipsis-vertical" />
                    </button>
                    {openMenuId === role.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={() => handleEdit(role)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                        >
                          <i className="fa-solid fa-pen text-gray-400 w-4" />
                          Edit Role
                        </button>
                        <button
                          onClick={() => handleViewStaff(role.id)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                        >
                          <i className="fa-solid fa-users text-gray-400 w-4" />
                          View Staff
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                        >
                          <i className="fa-solid fa-trash text-red-400 w-4" />
                          Delete Role
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !isAllSelected && isSomeSelected;
                  }}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                Role Name
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                Management Role
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden lg:table-cell">
                Created By
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden xl:table-cell">
                Created At
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden xl:table-cell">
                Updated At
              </th>
              <th className="w-12 px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No roles found
                </td>
              </tr>
            ) : (
              roles.map((role, index) => (
                <tr
                  key={role.id}
                  className={`border-b border-gray-100 hover:bg-indigo-100 ${
                    index % 2 === 0 ? 'bg-indigo-50/50' : ''
                  } ${selectedIds.has(role.id) ? 'bg-indigo-100' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(role.id)}
                      onChange={() => onSelectRole(role.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{role.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.isManagement
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {role.isManagement ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">
                    {formatCreatedBy(role.createdBy)}
                  </td>
                  <td className="px-6 py-4 text-gray-600 hidden xl:table-cell">
                    {formatDate(role.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-gray-600 hidden xl:table-cell">
                    {formatDate(role.updatedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative" ref={openMenuId === role.id ? menuRef : null}>
                      <button
                        onClick={(e) => openRowMenu(e, role.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="fa-solid fa-ellipsis-vertical" />
                      </button>
                      {openMenuId === role.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <button
                            onClick={() => handleEdit(role)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                          >
                            <i className="fa-solid fa-pen text-gray-400 w-4" />
                            Edit Role
                          </button>
                          <button
                            onClick={() => handleViewStaff(role.id)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                          >
                            <i className="fa-solid fa-users text-gray-400 w-4" />
                            View Staff
                          </button>
                          <button
                            onClick={() => handleDelete(role)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <i className="fa-solid fa-trash text-red-400 w-4" />
                            Delete Role
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RolesTable;