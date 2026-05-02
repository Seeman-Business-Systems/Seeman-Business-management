import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { useGetDashboardSummaryQuery } from '../store/api/analyticsApi';
import { useGetBranchesQuery } from '../store/api/branchesApi';
import { useGetActivitiesQuery } from '../store/api/activitiesApi';
import { generateActivityText } from '../utils/activityTextGenerator';

type DatePreset =
  | 'thisWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'last7days'
  | 'custom';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(n);
const fmtCurrency = (n: number) => `₦${fmt(n)}`;
const formatDate = (d: Date) => d.toISOString().split('T')[0];

// Y-axis ticks in millions (ascending: 0 bottom → 300M top). Non-linear to give
// small values more vertical space. Values above 300M clip at the top.
const Y_TICKS_M = [0, 10, 30, 50, 100, 150, 300];

const valueToPct = (val: number): number => {
  const m = val / 1_000_000;
  if (m <= 0) return 0;
  const last = Y_TICKS_M.length - 1;
  if (m >= Y_TICKS_M[last]) return 1;
  for (let i = 1; i < Y_TICKS_M.length; i++) {
    if (m <= Y_TICKS_M[i]) {
      const segRatio =
        (m - Y_TICKS_M[i - 1]) / (Y_TICKS_M[i] - Y_TICKS_M[i - 1]);
      return (i - 1 + segRatio) / last;
    }
  }
  return 1;
};

const getPresetRange = (preset: DatePreset): { from: string; to: string } => {
  const today = new Date();
  const to = formatDate(today);
  if (preset === 'thisWeek') {
    const d = new Date(today);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return { from: formatDate(d), to };
  }
  if (preset === 'thisMonth') {
    return {
      from: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      to,
    };
  }
  if (preset === 'lastMonth') {
    return {
      from: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      to: formatDate(new Date(today.getFullYear(), today.getMonth(), 0)),
    };
  }
  if (preset === 'last7days') {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return { from: formatDate(d), to };
  }
  return { from: '', to: '' };
};

const monthLabel = (period: string): string => {
  const d = new Date(period + 'T00:00:00');
  return d.toLocaleString('default', { month: 'short' });
};

const timeAgo = (dateStr: string): string => {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700',
  PARTIAL: 'bg-amber-100 text-amber-700',
  PENDING: 'bg-gray-100 text-gray-600',
};

const ACTIVITY_ICONS: Record<string, string> = {
  SALE_CREATED: 'fa-receipt',
  SALE_CANCELLED: 'fa-ban',
  PAYMENT_RECORDED: 'fa-money-bill-wave',
  INVENTORY_ADJUSTED: 'fa-layer-group',
  INVENTORY_TRANSFERRED: 'fa-right-left',
  PRODUCT_CREATED: 'fa-box',
  BRANCH_CREATED: 'fa-building',
  WAREHOUSE_CREATED: 'fa-warehouse',
  CUSTOMER_CREATED: 'fa-user-plus',
  STAFF_REGISTERED: 'fa-id-card',
  SUPPLY_CREATED: 'fa-truck-fast',
  SUPPLY_FULFILLED: 'fa-circle-check',
  STAFF_TRANSFERRED: 'fa-right-left',
  EXPENSE_RECORDED: 'fa-money-bill-trend-up',
  CONTAINER_OFFLOADED: 'fa-box-open',
};

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'thisWeek', label: 'This Week' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'last7days', label: 'Last 7 Days' },
  { key: 'custom', label: 'Custom' },
];

const CHART_H = 160;

function StatCard({
  label,
  value,
  sub,
  colorClass,
  icon,
  loading,
  to,
}: {
  label: string;
  value: string;
  sub?: string;
  colorClass: string;
  icon: string;
  loading?: boolean;
  to?: string;
}) {
  const inner = (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${to ? 'hover:border-indigo-200 transition-colors' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}
        >
          <i className={`fa-solid ${icon} text-sm text-white`} />
        </div>
      </div>
      {loading ? (
        <div className="h-7 w-28 bg-gray-100 animate-pulse rounded" />
      ) : (
        <p
          className={`font-bold text-gray-900 truncate ${value.length > 13 ? 'text-base' : value.length > 10 ? 'text-lg' : 'text-xl'}`}
        >
          {value}
        </p>
      )}
      <p className="text-xs text-gray-400 mt-1 min-h-[16px]">
        {!loading && (sub ?? '')}
      </p>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

const GLOBAL_ROLES = ['CEO', 'Super Admin'];

function Dashboard() {
  usePageTitle('Dashboard');
  const { user, can } = useAuth();

  const isGlobalView = GLOBAL_ROLES.includes(user?.role?.name ?? '');
  const scopedBranchId = !isGlobalView
    ? (user?.branch?.id ?? undefined)
    : undefined;

  const [preset, setPreset] = useState<DatePreset>('thisMonth');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(
    undefined,
  );

  // Global roles can pick any branch; scoped roles are fixed to their branch
  const branchId = isGlobalView ? selectedBranchId : scopedBranchId;

  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!newMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (
        newMenuRef.current &&
        !newMenuRef.current.contains(e.target as Node)
      ) {
        setNewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [newMenuOpen]);

  const { from: dateFrom, to: dateTo } = useMemo(() => {
    if (preset !== 'custom') return getPresetRange(preset);
    return { from: customFrom, to: customTo };
  }, [preset, customFrom, customTo]);

  const { data: branches = [] } = useGetBranchesQuery();

  const { data, isLoading } = useGetDashboardSummaryQuery(
    { branchId, dateFrom, dateTo },
    { skip: !dateFrom || !dateTo, refetchOnMountOrArgChange: true },
  );

  const yTicksDesc = useMemo(() => [...Y_TICKS_M].reverse(), []);

  const { data: activitiesData, isLoading: activitiesLoading } =
    useGetActivitiesQuery({
      take: 8,
      ...(branchId ? { branchId } : {}),
    });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Welcome back, {user?.firstName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {can('sale:create') && (
              <Link
                to="/sales/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
              >
                <i className="fa-solid fa-plus" />
                Record Sale
              </Link>
            )}

            <div className="relative" ref={newMenuRef}>
              <button
                onClick={() => setNewMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <i className="fa-solid fa-plus text-gray-500" />
                New
                <i
                  className={`fa-solid fa-chevron-down text-xs text-gray-400 transition-transform ${newMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {newMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30">
                  {can('expense:create') && (
                    <Link
                      to="/expenses?action=create"
                      onClick={() => setNewMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <i className="fa-solid fa-money-bill-wave w-4 text-rose-500" />
                      Record Expense
                    </Link>
                  )}
                  {can('payment:record') && (
                    <Link
                      to="/sales?paymentStatus=unpaid"
                      onClick={() => setNewMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <i className="fa-solid fa-hand-holding-dollar w-4 text-emerald-500" />
                      Record Payment
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-3 sm:items-center">
          {/* Branch — only shown to global roles */}
          {isGlobalView && (
            <select
              value={selectedBranchId ?? ''}
              onChange={(e) =>
                setSelectedBranchId(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-full sm:w-30 border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {/* Preset buttons — on mobile: 3-col then 2-col rows; on desktop: single flex row */}
          <div className="sm:hidden space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.slice(0, 3).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPreset(key)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${preset === key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.slice(3).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPreset(key)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${preset === key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex gap-1 flex-wrap">
            {PRESETS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPreset(key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${preset === key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {preset === 'custom' && (
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Revenue"
            value={fmtCurrency(data?.revenue ?? 0)}
            sub={`${data?.salesCount ?? 0} sales`}
            colorClass="bg-emerald-500"
            icon="fa-arrow-trend-up"
            loading={isLoading}
          />
          <StatCard
            label="Expenses"
            value={fmtCurrency(data?.expenses ?? 0)}
            colorClass="bg-rose-500"
            icon="fa-receipt"
            loading={isLoading}
            to="/expenses"
          />
          <StatCard
            label="Sales"
            value={String(data?.salesCount ?? 0)}
            colorClass="bg-violet-500"
            icon="fa-cart-shopping"
            loading={isLoading}
            to="/sales"
          />
          <StatCard
            label="Unpaid Sales"
            value={fmtCurrency(data?.pendingPayments ?? 0)}
            sub="pending / partial"
            colorClass="bg-amber-500"
            icon="fa-clock"
            loading={isLoading}
            to="/sales?paymentStatus=PENDING"
          />
          <StatCard
            label="Pending Supplies"
            value={String(data?.pendingSupplies ?? 0)}
            sub="awaiting fulfillment"
            colorClass="bg-sky-500"
            icon="fa-truck-fast"
            loading={isLoading}
            to="/supplies?status=DRAFT"
          />
          <StatCard
            label="Low Stock"
            value={String(data?.lowStockCount ?? 0)}
            sub="items below reorder"
            colorClass="bg-red-500"
            icon="fa-triangle-exclamation"
            loading={isLoading}
            to="/inventory"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Revenue vs Expenses Chart */}
          <div className="lg:col-span-7 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">
                Revenue vs Expenses - Last 6 months
              </h2>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block" />
                  Expenses
                </span>
              </div>
            </div>

            {isLoading ? (
              <div
                className="flex gap-2 items-end pl-10"
                style={{ height: `${CHART_H}px` }}
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-1 flex gap-0.5 items-end">
                    <div
                      className="flex-1 bg-gray-100 animate-pulse rounded-t"
                      style={{ height: `${30 + i * 18}px` }}
                    />
                    <div
                      className="flex-1 bg-gray-100 animate-pulse rounded-t"
                      style={{ height: `${20 + i * 10}px` }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex">
                  {/* Y-axis labels — absolutely positioned against chart height */}
                  <div
                    className="relative flex-shrink-0"
                    style={{ width: '40px', height: `${CHART_H}px` }}
                  >
                    {yTicksDesc.map((m, i) => (
                      <span
                        key={i}
                        className="absolute right-2 text-xs text-gray-400 leading-none"
                        style={{
                          top: `${(i / (yTicksDesc.length - 1)) * 100}%`,
                          transform: 'translateY(-50%)',
                        }}
                      >
                        {m === 0 ? '0' : `${m}M`}
                      </span>
                    ))}
                  </div>

                  {/* Bars + grid */}
                  <div
                    className="flex-1 relative border-b border-gray-200"
                    style={{ height: `${CHART_H}px` }}
                  >
                    {/* Grid lines (all except the bottom 0-line) */}
                    {yTicksDesc.slice(0, -1).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full border-t border-gray-100"
                        style={{
                          top: `${(i / (yTicksDesc.length - 1)) * 100}%`,
                        }}
                      />
                    ))}

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end gap-1 px-0.5">
                      {(data?.chartData ?? []).map((bar) => (
                        <div
                          key={bar.period}
                          className="flex-1 flex gap-0.5 items-end h-full"
                        >
                          <div className="group/rev relative flex-1 flex items-end h-full">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover/rev:opacity-100 transition-opacity pointer-events-none z-20">
                              Revenue: {fmtCurrency(bar.revenue)}
                            </div>
                            <div
                              className="w-full bg-indigo-500 hover:bg-indigo-400 rounded-t transition-colors"
                              style={{
                                height: `${valueToPct(bar.revenue) * 100}%`,
                                minHeight: bar.revenue > 0 ? '2px' : '0',
                              }}
                            />
                          </div>
                          <div className="group/exp relative flex-1 flex items-end h-full">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover/exp:opacity-100 transition-opacity pointer-events-none z-20">
                              Expenses: {fmtCurrency(bar.expenses)}
                            </div>
                            <div
                              className="w-full bg-rose-400 hover:bg-rose-300 rounded-t transition-colors"
                              style={{
                                height: `${valueToPct(bar.expenses) * 100}%`,
                                minHeight: bar.expenses > 0 ? '2px' : '0',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* X-axis labels aligned to bars */}
                <div
                  className="flex gap-1 mt-1.5"
                  style={{ paddingLeft: '40px' }}
                >
                  {(data?.chartData ?? []).map((bar) => (
                    <div key={bar.period} className="flex-1 text-center">
                      <span className="text-xs text-gray-400">
                        {monthLabel(bar.period)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">
                Top Products
              </h2>
              <Link
                to="/products"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all
              </Link>
            </div>
            {isLoading ? (
              <div className="p-5 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-5 h-5 bg-gray-100 animate-pulse rounded" />
                    <div className="flex-1 h-4 bg-gray-100 animate-pulse rounded" />
                    <div className="w-16 h-4 bg-gray-100 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : (data?.topProducts ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">
                No sales in this period
              </p>
            ) : (
              <div className="divide-y divide-gray-50">
                {(data?.topProducts ?? []).map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-5 text-xs font-bold text-gray-400 flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {p.variantName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {p.productName}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {fmtCurrency(p.totalRevenue)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.totalQty} units
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-6">
          {/* Recent Sales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">
                Recent Sales
              </h2>
              <Link
                to="/sales"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all
              </Link>
            </div>
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-100 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : (data?.recentSales ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">
                No sales in this period
              </p>
            ) : (
              <div className="divide-y divide-gray-50">
                {(data?.recentSales ?? []).map((s, i) => (
                  <Link
                    key={s.id}
                    to={`/sales/${s.id}`}
                    className={`flex items-center justify-between px-5 py-3 hover:bg-indigo-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {s.saleNumber} · {s.branchName}
                      </p>
                      <p className="text-xs text-gray-400">
                        by {s.soldByName} · {timeAgo(s.soldAt)}
                      </p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {fmtCurrency(s.totalAmount)}
                      </p>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PAYMENT_STATUS_STYLES[s.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {s.paymentStatus}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">
                Recent Activities
              </h2>
              <Link
                to="/activities"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all
              </Link>
            </div>
            {activitiesLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-100 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : (activitiesData?.data ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">
                No recent activities
              </p>
            ) : (
              <div className="divide-y divide-gray-50">
                {(activitiesData?.data ?? []).map((a, i) => (
                  <div
                    key={a.id}
                    className={`flex items-start gap-3 px-5 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i
                        className={`fa-solid ${ACTIVITY_ICONS[a.type] ?? 'fa-circle'} text-xs text-indigo-600`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-snug truncate">
                        {generateActivityText(a)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {a.actorName && <span>by {a.actorName} · </span>}
                        {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
