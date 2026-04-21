import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { EnrichedInventoryRecord } from '../../types/inventory';

interface InventoryTableProps {
  records: EnrichedInventoryRecord[];
  startIndex: number;
  endIndex: number;
  total: number;
  resultsPerPage: number;
  onResultsPerPageChange: (value: number) => void;
  onSetReorderLevels: (record: EnrichedInventoryRecord) => void;
  onAddStock: (record: EnrichedInventoryRecord) => void;
  onAdjustStock: (record: EnrichedInventoryRecord) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function AvailableBadge({ value, low }: { value: number; low: boolean }) {
  if (low) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <i className="fa-solid fa-triangle-exclamation text-xs" />
        {value}
      </span>
    );
  }
  if (value > 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        {value}
      </span>
    );
  }
  return <span className="font-medium text-gray-400">0</span>;
}

function InventoryTable({
  records,
  startIndex,
  endIndex,
  total,
  resultsPerPage,
  onResultsPerPageChange,
  onSetReorderLevels,
  onAddStock,
  onAdjustStock,
}: InventoryTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
          Showing {total > 0 ? startIndex + 1 : 0} – {endIndex} of {total} records
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Results per page:</span>
          <select
            value={resultsPerPage}
            onChange={(e) => onResultsPerPageChange(Number(e.target.value))}
            className="appearance-none px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent bg-white cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {records.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">No inventory records found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {records.map((record) => (
              <div key={record.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/variants/${record.variantId}`}
                      className="font-medium text-gray-900 hover:text-indigo-600 block truncate"
                    >
                      {record.variant?.variantName ?? '—'}
                    </Link>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">{record.variant?.sku ?? '—'}</p>
                    {record.brandName && (
                      <p className="text-xs text-gray-500 mt-0.5">{record.brandName}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      <i className="fa-solid fa-warehouse mr-1" />
                      {record.warehouse?.name ?? '—'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        Available: <AvailableBadge value={record.availableQuantity} low={record.isLowInventory} />
                      </span>
                      <span className="text-gray-500">
                        Reserved: <span className="font-medium text-gray-700">{record.reservedQuantity}</span>
                      </span>
                      <span className="text-gray-500">
                        Total: <span className="font-medium text-gray-700">{record.totalQuantity}</span>
                      </span>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0" ref={openMenuId === record.id ? menuRef : null}>
                    <button
                      onClick={(e) => openRowMenu(e, record.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <i className="fa-solid fa-ellipsis-vertical" />
                    </button>
                    {openMenuId === record.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                          to={`/variants/${record.variantId}`}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-eye text-gray-400 w-4" />
                          View Variant
                        </Link>
                        <button
                          onClick={() => { setOpenMenuId(null); onAddStock(record); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-plus text-gray-400 w-4" />
                          Add Stock
                        </button>
                        <button
                          onClick={() => { setOpenMenuId(null); onAdjustStock(record); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-pen-to-square text-gray-400 w-4" />
                          Adjust Stock
                        </button>
                        <button
                          onClick={() => { setOpenMenuId(null); onSetReorderLevels(record); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-sliders text-gray-400 w-4" />
                          Set Reorder Levels
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
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Variant</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden lg:table-cell">Brand</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden lg:table-cell">Warehouse</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Available</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden lg:table-cell">Reserved</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden xl:table-cell">Total</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden xl:table-cell">Min</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden lg:table-cell">Price</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="w-12 px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                  No inventory records found
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr
                  key={record.id}
                  className={`border-b border-gray-100 hover:bg-indigo-50 ${
                    index % 2 === 0 ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <Link
                      to={`/variants/${record.variantId}`}
                      className="font-medium text-gray-900 hover:text-indigo-600 block"
                    >
                      {record.variant?.variantName ?? '—'}
                    </Link>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">{record.variant?.sku ?? '—'}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-700">{record.brandName ?? '—'}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-700">{record.warehouse?.name ?? '—'}</span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {record.warehouse?.city}, {record.warehouse?.state}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <AvailableBadge value={record.availableQuantity} low={record.isLowInventory} />
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-700">{record.reservedQuantity}</span>
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell">
                    <span className="text-gray-700">{record.totalQuantity}</span>
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell">
                    <span className="text-gray-500 text-sm">{record.minimumQuantity}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-700">
                      {record.variant?.sellingPrice != null ? formatPrice(record.variant.sellingPrice) : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {record.isLowInventory ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <i className="fa-solid fa-triangle-exclamation" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <i className="fa-solid fa-circle-check" />
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative" ref={openMenuId === record.id ? menuRef : null}>
                      <button
                        onClick={(e) => openRowMenu(e, record.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="fa-solid fa-ellipsis-vertical" />
                      </button>
                      {openMenuId === record.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <Link
                            to={`/variants/${record.variantId}`}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-eye text-gray-400 w-4" />
                            View Variant
                          </Link>
                          <button
                            onClick={() => { setOpenMenuId(null); onAddStock(record); }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-plus text-gray-400 w-4" />
                            Add Stock
                          </button>
                          <button
                            onClick={() => { setOpenMenuId(null); onAdjustStock(record); }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-pen-to-square text-gray-400 w-4" />
                            Adjust Stock
                          </button>
                          <button
                            onClick={() => { setOpenMenuId(null); onSetReorderLevels(record); }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-sliders text-gray-400 w-4" />
                            Set Reorder Levels
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

export default InventoryTable;
