import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Staff as StaffType } from '../../types/auth';

interface StaffTableProps {
  staff: StaffType[];
  selectedIds: Set<number>;
  onSelectOne: (id: number) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  startIndex: number;
  endIndex: number;
  total: number;
  resultsPerPage: number;
  onResultsPerPageChange: (value: number) => void;
}

function StaffTable({
  staff,
  selectedIds,
  onSelectOne,
  onSelectAll,
  isAllSelected,
  isSomeSelected,
  startIndex,
  endIndex,
  total,
  resultsPerPage,
  onResultsPerPageChange,
}: StaffTableProps) {
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

  const openRowMenu = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Results count and per page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {total > 0 ? startIndex + 1 : 0} - {endIndex} results out of {total}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Results per page:</span>
          <select
            value={resultsPerPage}
            onChange={(e) => onResultsPerPageChange(Number(e.target.value))}
            className="appearance-none px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent bg-white cursor-pointer"
          >
            <option value={6}>6</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {staff.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            No staff members found
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {staff.map((member) => (
              <div
                key={member.id}
                className={`p-4 ${selectedIds.has(member.id) ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(member.id)}
                    onChange={() => onSelectOne(member.id)}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/staff/${member.id}`}
                      className="flex items-center gap-3 hover:opacity-80"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-user text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{member.fullName}</p>
                        <p className="text-sm text-gray-500 truncate">{member.email || '-'}</p>
                      </div>
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      {member.role && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {member.role.name}
                        </span>
                      )}
                      {member.branch && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <i className="fa-solid fa-code-branch mr-1 text-gray-400" />
                          {member.branch.name}
                        </span>
                      )}
                    </div>
                    {member.phoneNumber && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <i className="fa-solid fa-phone text-gray-400" />
                        {member.phoneNumber}
                      </div>
                    )}
                  </div>
                  <div className="relative flex-shrink-0" ref={openMenuId === member.id ? menuRef : null}>
                    <button
                      onClick={(e) => openRowMenu(e, member.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <i className="fa-solid fa-ellipsis-vertical" />
                    </button>
                    {openMenuId === member.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                          to={`/staff/${member.id}`}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-eye text-gray-400 w-4" />
                          View Details
                        </Link>
                        <Link
                          to={`/staff/${member.id}/edit`}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-pen text-gray-400 w-4" />
                          Edit
                        </Link>
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
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  Name
                  <i className="fa-solid fa-sort text-gray-300" />
                </div>
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  Role
                  <i className="fa-solid fa-sort text-gray-300" />
                </div>
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  Branch
                  <i className="fa-solid fa-sort text-gray-300" />
                </div>
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden xl:table-cell">
                <div className="flex items-center gap-2">
                  Phone
                  <i className="fa-solid fa-sort text-gray-300" />
                </div>
              </th>
              <th className="w-12 px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No staff members found
                </td>
              </tr>
            ) : (
              staff.map((member, index) => (
                <tr
                  key={member.id}
                  className={`border-b border-gray-100 hover:bg-indigo-100 ${
                    index % 2 === 0 ? 'bg-indigo-50/50' : ''
                  } ${selectedIds.has(member.id) ? 'bg-indigo-100' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(member.id)}
                      onChange={() => onSelectOne(member.id)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/staff/${member.id}`}
                      className="flex items-center gap-3 hover:opacity-80"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-user text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{member.fullName}</p>
                        <p className="text-sm text-gray-500 truncate">{member.email || '-'}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{member.role?.name || '-'}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-700">{member.branch?.name || '-'}</span>
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell">
                    <div className="flex items-center gap-2 text-gray-700">
                      <i className="fa-solid fa-phone text-gray-400 text-sm" />
                      {member.phoneNumber || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative" ref={openMenuId === member.id ? menuRef : null}>
                      <button
                        onClick={(e) => openRowMenu(e, member.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="fa-solid fa-ellipsis-vertical" />
                      </button>
                      {openMenuId === member.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <Link
                            to={`/staff/${member.id}`}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-eye text-gray-400 w-4" />
                            View Details
                          </Link>
                          <Link
                            to={`/staff/${member.id}/edit`}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-pen text-gray-400 w-4" />
                            Edit
                          </Link>
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

export default StaffTable;