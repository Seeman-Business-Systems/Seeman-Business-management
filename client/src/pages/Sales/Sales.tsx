import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import SalesTable from './SalesTable';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetSalesQuery } from '../../store/api/salesApi';
import { useGetBranchesQuery } from '../../store/api/branchesApi';
import { SaleStatus, PaymentStatus } from '../../types/sale';

type TabType = 'all' | 'fulfilled' | 'cancelled' | 'draft';

const tabs: { key: TabType; label: string; status?: SaleStatus }[] = [
  { key: 'all', label: 'All' },
  { key: 'fulfilled', label: 'Fulfilled', status: SaleStatus.FULFILLED },
  { key: 'cancelled', label: 'Cancelled', status: SaleStatus.CANCELLED },
  { key: 'draft', label: 'Draft', status: SaleStatus.DRAFT },
];

function Sales() {
  usePageTitle('Sales');
  const { can } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>(
    searchParams.get('paymentStatus') ?? 'all',
  );

  useEffect(() => {
    if (searchParams.has('paymentStatus')) {
      searchParams.delete('paymentStatus');
      setSearchParams(searchParams, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);

  const activeStatus = tabs.find((t) => t.key === activeTab)?.status;

  const skip = (currentPage - 1) * resultsPerPage;

  const { data, isLoading, isFetching } = useGetSalesQuery({
    status: activeStatus,
    branchId: selectedBranch !== 'all' ? Number(selectedBranch) : undefined,
    paymentStatus: selectedPaymentStatus !== 'all' ? (selectedPaymentStatus as PaymentStatus) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    search: searchQuery.trim() || undefined,
    take: resultsPerPage,
    skip,
  });

  const { data: branches = [] } = useGetBranchesQuery();

  const sales = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / resultsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBranch, selectedPaymentStatus, dateFrom, dateTo, activeTab, resultsPerPage]);

  const startIndex = skip;
  const endIndex = Math.min(skip + resultsPerPage, total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '…', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '…', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '…', currentPage - 1, currentPage, currentPage + 1, '…', totalPages);
    }
    return pages;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales</h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} total sale{total !== 1 ? 's' : ''}</p>
          </div>
          {can('sale:create') && (
            <Link
              to="/sales/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <i className="fa-solid fa-plus" />
              Record Sale
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by sale number or customer name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              />
              {isFetching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Branch filter */}
              <div className="relative flex-1 min-w-[140px]">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                >
                  <option value="all">All branches</option>
                  {branches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <i className="fa-solid fa-code-branch absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* Payment status filter */}
              <div className="relative flex-1 min-w-[150px]">
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                >
                  <option value="all">All payment status</option>
                  <option value={PaymentStatus.PENDING}>Pending</option>
                  <option value={PaymentStatus.PARTIAL}>Partial</option>
                  <option value={PaymentStatus.PAID}>Paid</option>
                </select>
                <i className="fa-solid fa-circle-dollar-to-slot absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* Date from */}
              <div className="relative flex-1 min-w-[140px]">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                  placeholder="From"
                />
                <i className="fa-solid fa-calendar absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              </div>

              {/* Date to */}
              <div className="relative flex-1 min-w-[140px]">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                  placeholder="To"
                />
                <i className="fa-solid fa-calendar-check absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <SalesTable
          sales={sales}
          startIndex={startIndex}
          endIndex={endIndex}
          total={total}
          resultsPerPage={resultsPerPage}
          onResultsPerPageChange={setResultsPerPage}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-arrow-left" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) =>
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-gray-400">{page}</span>
                  )
                )}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Sales;
