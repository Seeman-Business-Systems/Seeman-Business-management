import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetSuppliesQuery, useFulfilSupplyMutation } from '../../store/api/suppliesApi';
import { useGetBranchesQuery } from '../../store/api/branchesApi';
import { useToast } from '../../context/ToastContext';
import type { Supply, SupplyStatus } from '../../types/supply';

type TabKey = 'all' | 'DRAFT' | 'FULFILLED' | 'CANCELLED';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'FULFILLED', label: 'Fulfilled' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const statusStyles: Record<SupplyStatus, string> = {
  DRAFT:      'bg-yellow-100 text-yellow-800',
  FULFILLED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
};

const PAGE_SIZE = 10;

function Supplies() {
  usePageTitle('Supplies');

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { setCurrentPage(1); }, [activeTab, selectedBranch, dateFrom, dateTo]);

  const { showToast } = useToast();
  const [fulfilSupply, { isLoading: isFulfilling }] = useFulfilSupplyMutation();
  const [pendingFulfil, setPendingFulfil] = useState<Supply | null>(null);
  const [fulfilNotes, setFulfilNotes] = useState('');

  const handleFulfilConfirm = async () => {
    if (!pendingFulfil) return;
    try {
      await fulfilSupply({ id: pendingFulfil.id, notes: fulfilNotes || undefined }).unwrap();
      setPendingFulfil(null);
      setFulfilNotes('');
      showToast('success', 'Supply marked as fulfilled');
    } catch {
      showToast('error', 'Failed to fulfil supply');
    }
  };

  const skip = (currentPage - 1) * PAGE_SIZE;

  const { data, isLoading, isFetching } = useGetSuppliesQuery({
    status: activeTab !== 'all' ? activeTab : undefined,
    branchId: selectedBranch !== 'all' ? Number(selectedBranch) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    take: PAGE_SIZE,
    skip,
  });

  const { data: branches = [] } = useGetBranchesQuery();

  const supplies = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getPageNumbers = () => {
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
    return pages;
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Supplies</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200 px-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-gray-100">
            <div className="relative flex-1 min-w-[140px]">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
              >
                <option value="all">All branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <i className="fa-solid fa-building absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            </div>
            <div className="flex gap-3">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="From"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="To"
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
            </div>
          ) : supplies.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <i className="fa-solid fa-truck-fast text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500 font-medium">No supplies found</p>
              <p className="text-sm text-gray-400 mt-1">Supplies are created automatically when a sale is recorded.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Supply #</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sale</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="w-10 px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {supplies.map((supply, i) => (
                      <tr
                        key={supply.id}
                        className={`hover:bg-indigo-50 transition-colors ${i % 2 === 0 ? 'bg-indigo-50/30' : ''} ${isFetching ? 'opacity-60' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={`/supplies/${supply.id}`}
                            className="font-medium text-gray-900 hover:text-indigo-600 font-mono text-sm"
                          >
                            {supply.supplyNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/sales/${supply.saleId}`}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-mono"
                          >
                            {supply.saleNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            {supply.items.slice(0, 2).map((item) => (
                              <span key={item.id} className="text-sm text-gray-700">
                                {item.quantity}× {item.variantName ?? '—'}
                              </span>
                            ))}
                            {supply.items.length > 2 && (
                              <span className="text-xs text-gray-400">+{supply.items.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[supply.status]}`}>
                            {supply.status.charAt(0) + supply.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(supply.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {supply.status === 'DRAFT' && (
                              <button
                                onClick={() => setPendingFulfil(supply)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium"
                              >
                                <i className="fa-solid fa-circle-check" />
                                Fulfil
                              </button>
                            )}
                            <Link
                              to={`/supplies/${supply.id}`}
                              className="text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              <i className="fa-solid fa-chevron-right" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {supplies.map((supply) => (
                  <div key={supply.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link to={`/supplies/${supply.id}`} className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 font-mono text-sm">{supply.supplyNumber}</p>
                        <p className="text-sm text-indigo-600 mt-0.5">{supply.saleNumber}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {supply.items.length} item{supply.items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(supply.createdAt)}</p>
                      </Link>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[supply.status]}`}>
                          {supply.status.charAt(0) + supply.status.slice(1).toLowerCase()}
                        </span>
                        {supply.status === 'DRAFT' && (
                          <button
                            onClick={() => setPendingFulfil(supply)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs font-medium"
                          >
                            <i className="fa-solid fa-circle-check text-xs" />
                            Fulfil
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
                {getPageNumbers().map((page, i) =>
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
                )}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        )}
      </div>
      <Modal
        isOpen={!!pendingFulfil}
        onClose={() => { setPendingFulfil(null); setFulfilNotes(''); }}
        title="Mark Supply as Fulfilled"
        leftButton={{ text: 'Cancel', onClick: () => { setPendingFulfil(null); setFulfilNotes(''); }, variant: 'secondary' }}
        rightButton={{ text: isFulfilling ? 'Saving…' : 'Mark Fulfilled', onClick: handleFulfilConfirm, variant: 'primary' }}
      >
        <p className="text-gray-600 mb-4">
          Confirm that{' '}
          <span className="font-semibold text-gray-900">{pendingFulfil?.supplyNumber}</span>{' '}
          has been waybilled to the customer.
        </p>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea
          value={fulfilNotes}
          onChange={(e) => setFulfilNotes(e.target.value)}
          rows={3}
          placeholder="Delivery notes, signature reference, etc."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </Modal>
    </Layout>
  );
}

export default Supplies;
