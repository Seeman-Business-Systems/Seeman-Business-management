import { useState, useMemo } from 'react';
import { Layout } from '../../components/layout';
import { useAuth } from '../../context/AuthContext';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetBranchesQuery } from '../../store/api/branchesApi';
import {
  useGetSalesReportQuery,
  useGetExpensesReportQuery,
  useGetInventoryReportQuery,
  useGetProductsReportQuery,
  useGetCustomersReportQuery,
  useGetStaffReportQuery,
} from '../../store/api/reportsApi';
import { EXPENSE_CATEGORY_LABELS } from '../../types/expense';
import type { ExpenseCategory } from '../../types/expense';

type Tab = 'sales' | 'expenses' | 'inventory' | 'products' | 'customers' | 'staff';
type DatePreset = 'thisWeek' | 'thisMonth' | 'lastMonth' | 'last7days' | 'custom';

const fmt = (n: number) => new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(n);
const fmtCurrency = (n: number) => `₦${fmt(n)}`;
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const formatD = (d: Date) => d.toISOString().split('T')[0];

const getPresetRange = (preset: DatePreset): { from: string; to: string } => {
  const today = new Date();
  const to = formatD(today);
  if (preset === 'thisWeek') {
    const d = new Date(today);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return { from: formatD(d), to };
  }
  if (preset === 'thisMonth') {
    return { from: formatD(new Date(today.getFullYear(), today.getMonth(), 1)), to };
  }
  if (preset === 'lastMonth') {
    return {
      from: formatD(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      to: formatD(new Date(today.getFullYear(), today.getMonth(), 0)),
    };
  }
  if (preset === 'last7days') {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return { from: formatD(d), to };
  }
  return { from: '', to: '' };
};

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'thisWeek', label: 'This Week' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'last7days', label: 'Last 7 Days' },
  { key: 'custom', label: 'Custom' },
];

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'sales', label: 'Sales', icon: 'fa-receipt' },
  { key: 'expenses', label: 'Expenses', icon: 'fa-money-bill-wave' },
  { key: 'inventory', label: 'Inventory', icon: 'fa-layer-group' },
  { key: 'products', label: 'Products', icon: 'fa-box' },
  { key: 'customers', label: 'Customers', icon: 'fa-users' },
  { key: 'staff', label: 'Staff', icon: 'fa-id-card' },
];

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700',
  PARTIAL: 'bg-amber-100 text-amber-700',
  PENDING: 'bg-gray-100 text-gray-600',
};

function StatCard({ label, value, sub, colorClass, icon }: {
  label: string; value: string; sub?: string; colorClass: string; icon: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
          <i className={`fa-solid ${icon} text-sm text-white`} />
        </div>
      </div>
      <p className={`font-bold text-gray-900 truncate ${value.length > 13 ? 'text-base' : value.length > 10 ? 'text-lg' : 'text-xl'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <div className="p-4 space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-4">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="flex-1 h-4 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

function downloadCSV(filename: string, _title: string, _period: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function openPrintWindow(title: string, period: string, tableHtml: string) {
  const logoUrl = `${window.location.origin}/full-logo.png`;
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; padding: 32px; font-size: 13px; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 20px; }
    .header img { height: 40px; }
    .header-right { text-align: right; }
    .header-right h1 { font-size: 18px; font-weight: 700; color: #111827; }
    .header-right p { font-size: 12px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; background: #f9fafb; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
    td { padding: 7px 12px; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #374151; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) td { background: #f9fafb; }
    tfoot td { font-weight: 700; background: #f3f4f6; border-top: 2px solid #e5e7eb; }
    .td-right { text-align: right; }
    .footer { margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoUrl}" alt="Seeman" onerror="this.style.display='none'" />
    <div class="header-right">
      <h1>${title}</h1>
      <p>${period}</p>
      <p>Generated ${new Date().toLocaleString('en-NG')}</p>
    </div>
  </div>
  ${tableHtml}
  <div class="footer">Seeman Business Management &mdash; Confidential</div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (w) w.addEventListener('unload', () => URL.revokeObjectURL(url));
}

function DownloadBar({
  onCsv, onPdf, disabled,
}: { onCsv: () => void; onPdf: () => void; disabled?: boolean }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onCsv}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <i className="fa-solid fa-file-csv text-emerald-600" />
        Export CSV
      </button>
      <button
        onClick={onPdf}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <i className="fa-solid fa-file-pdf text-rose-600" />
        Download PDF
      </button>
    </div>
  );
}

function Reports() {
  usePageTitle('Reports');
  const { can } = useAuth();

  const isGlobalView = can('filter:by-branch');

  const [activeTab, setActiveTab] = useState<Tab>('sales');
  const [preset, setPreset] = useState<DatePreset>('thisMonth');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);

  // Backend enforces branch scoping for non-global users. Global users may filter via dropdown.
  const branchId = isGlobalView ? selectedBranchId : undefined;

  const { from: dateFrom, to: dateTo } = useMemo(() => {
    if (preset !== 'custom') return getPresetRange(preset);
    return { from: customFrom, to: customTo };
  }, [preset, customFrom, customTo]);

  const { data: branches = [] } = useGetBranchesQuery();

  const skip = !dateFrom || !dateTo;
  const args = { dateFrom, dateTo, branchId };

  const { data: salesData, isLoading: salesLoading } = useGetSalesReportQuery(args, { skip: skip || activeTab !== 'sales' });
  const { data: expensesData, isLoading: expensesLoading } = useGetExpensesReportQuery(args, { skip: skip || activeTab !== 'expenses' });
  const { data: inventoryData, isLoading: inventoryLoading } = useGetInventoryReportQuery({ branchId }, { skip: activeTab !== 'inventory' });
  const { data: productsData, isLoading: productsLoading } = useGetProductsReportQuery(args, { skip: skip || activeTab !== 'products' });
  const { data: customersData, isLoading: customersLoading } = useGetCustomersReportQuery(args, { skip: skip || activeTab !== 'customers' });
  const { data: staffData, isLoading: staffLoading } = useGetStaffReportQuery(args, { skip: skip || activeTab !== 'staff' });

  const reportLabel = TABS.find((t) => t.key === activeTab)?.label ?? '';
  const periodLabel = preset !== 'custom'
    ? PRESETS.find((p) => p.key === preset)?.label
    : `${dateFrom} to ${dateTo}`;

  const title = `${reportLabel} Report`;
  const period = periodLabel ?? `${dateFrom} to ${dateTo}`;
  const branchName = branchId ? (branches.find((b) => b.id === branchId)?.name ?? '') : 'All Branches';

  // --- helpers ---
  const th = (cols: string[]) => `<tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>`;
  const tr = (cells: (string | number)[]) => `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
  const trR = (cells: (string | number)[]) => {
    const last = cells.length - 1;
    return `<tr>${cells.map((c, i) => `<td${i === last ? ' class="td-right"' : ''}>${c}</td>`).join('')}</tr>`;
  };

  // --- CSV handlers ---
  const handleSalesCsv = () => {
    if (!salesData) return;
    downloadCSV(`sales-report-${dateFrom}-${dateTo}.csv`, title, `${period} · ${branchName}`,
      ['Sale Number', 'Date', 'Customer', 'Branch', 'Sold By', 'Payment Status', 'Payment Method', 'Amount (NGN)'],
      salesData.rows.map((r) => [r.saleNumber, fmtDate(r.soldAt), r.customerName, r.branchName, r.soldByName, r.paymentStatus, r.paymentMethod ?? '—', r.totalAmount]),
    );
  };

  const handleExpensesCsv = () => {
    if (!expensesData) return;
    downloadCSV(`expenses-report-${dateFrom}-${dateTo}.csv`, title, `${period} · ${branchName}`,
      ['Date', 'Description', 'Category', 'Branch', 'Recorded By', 'Amount (NGN)'],
      expensesData.rows.map((r) => [fmtDate(r.date), r.description, EXPENSE_CATEGORY_LABELS[r.category as ExpenseCategory] ?? r.category, r.branchName, r.recordedByName, r.amount]),
    );
  };

  const handleInventoryCsv = () => {
    if (!inventoryData) return;
    downloadCSV(`inventory-report.csv`, title, branchName,
      ['Product', 'Variant', 'Warehouse', 'Branch', 'Total Qty', 'Available', 'Min Qty', 'Max Qty', 'Low Stock'],
      inventoryData.rows.map((r) => [r.productName, r.variantName, r.warehouseName, r.branchName, r.totalQuantity, r.availableQuantity, r.minimumQuantity, r.maximumQuantity, r.isLowStock ? 'Yes' : 'No']),
    );
  };

  const handleProductsCsv = () => {
    if (!productsData) return;
    downloadCSV(`products-report-${dateFrom}-${dateTo}.csv`, title, `${period} · ${branchName}`,
      ['Product', 'Variant', 'Units Sold', 'Orders', 'Revenue (NGN)'],
      productsData.rows.map((r) => [r.productName, r.variantName, r.totalQtySold, r.orderCount, r.totalRevenue]),
    );
  };

  const handleCustomersCsv = () => {
    if (!customersData) return;
    downloadCSV(`customers-report-${dateFrom}-${dateTo}.csv`, title, `${period} · ${branchName}`,
      ['Name', 'Email', 'Phone', 'Orders (Period)', 'Revenue (NGN)', 'Outstanding Balance (NGN)', 'Credit Limit (NGN)'],
      customersData.rows.map((r) => [r.name, r.email, r.phone, r.totalOrders, r.totalRevenue, r.outstandingBalance, r.creditLimit]),
    );
  };

  const handleStaffCsv = () => {
    if (!staffData) return;
    downloadCSV(`staff-report-${dateFrom}-${dateTo}.csv`, title, `${period} · ${branchName}`,
      ['Staff', 'Branch', 'Sales Count', 'Total Revenue (NGN)', 'Avg Sale Value (NGN)'],
      staffData.rows.map((r) => [r.staffName, r.branchName, r.salesCount, r.totalRevenue, Math.round(r.avgSaleValue)]),
    );
  };

  const csvHandlers: Record<Tab, () => void> = {
    sales: handleSalesCsv,
    expenses: handleExpensesCsv,
    inventory: handleInventoryCsv,
    products: handleProductsCsv,
    customers: handleCustomersCsv,
    staff: handleStaffCsv,
  };

  // --- PDF handlers ---
  const handlePdf = () => {
    let tableHtml = '';
    if (activeTab === 'sales' && salesData) {
      tableHtml = `<table><thead>${th(['Sale #', 'Date', 'Customer', 'Branch', 'Sold By', 'Status', 'Amount (NGN)'])}</thead><tbody>
        ${salesData.rows.map((r) => trR([r.saleNumber, fmtDate(r.soldAt), r.customerName, r.branchName, r.soldByName, r.paymentStatus, fmtCurrency(r.totalAmount)])).join('')}
        </tbody><tfoot><tr><td colspan="6"><strong>Total</strong></td><td class="td-right"><strong>${fmtCurrency(salesData.summary.totalRevenue)}</strong></td></tr></tfoot></table>`;
    } else if (activeTab === 'expenses' && expensesData) {
      tableHtml = `<table><thead>${th(['Date', 'Description', 'Category', 'Branch', 'Recorded By', 'Amount (NGN)'])}</thead><tbody>
        ${expensesData.rows.map((r) => trR([fmtDate(r.date), r.description || '—', EXPENSE_CATEGORY_LABELS[r.category as ExpenseCategory] ?? r.category, r.branchName, r.recordedByName, fmtCurrency(r.amount)])).join('')}
        </tbody><tfoot><tr><td colspan="5"><strong>Total</strong></td><td class="td-right"><strong>${fmtCurrency(expensesData.summary.totalExpenses)}</strong></td></tr></tfoot></table>`;
    } else if (activeTab === 'inventory' && inventoryData) {
      tableHtml = `<table><thead>${th(['Product', 'Variant', 'Warehouse', 'Branch', 'Total', 'Available', 'Min', 'Status'])}</thead><tbody>
        ${inventoryData.rows.map((r) => tr([r.productName, r.variantName, r.warehouseName, r.branchName, r.totalQuantity, r.availableQuantity, r.minimumQuantity, r.isLowStock ? 'Low Stock' : r.totalQuantity === 0 ? 'Empty' : 'OK'])).join('')}
        </tbody></table>`;
    } else if (activeTab === 'products' && productsData) {
      tableHtml = `<table><thead>${th(['#', 'Product', 'Variant', 'Orders', 'Units Sold', 'Revenue (NGN)'])}</thead><tbody>
        ${productsData.rows.map((r, i) => trR([i + 1, r.productName, r.variantName, r.orderCount, r.totalQtySold, fmtCurrency(r.totalRevenue)])).join('')}
        </tbody><tfoot><tr><td colspan="4"><strong>Total</strong></td><td class="td-right"><strong>${fmt(productsData.summary.totalUnitsSold)}</strong></td><td class="td-right"><strong>${fmtCurrency(productsData.summary.totalRevenue)}</strong></td></tr></tfoot></table>`;
    } else if (activeTab === 'customers' && customersData) {
      tableHtml = `<table><thead>${th(['Name', 'Email', 'Phone', 'Orders', 'Revenue (NGN)', 'Outstanding (NGN)', 'Credit Limit (NGN)'])}</thead><tbody>
        ${customersData.rows.map((r) => trR([r.name, r.email, r.phone, r.totalOrders, fmtCurrency(r.totalRevenue), fmtCurrency(r.outstandingBalance), fmtCurrency(r.creditLimit)])).join('')}
        </tbody></table>`;
    } else if (activeTab === 'staff' && staffData) {
      tableHtml = `<table><thead>${th(['#', 'Staff', 'Branch', 'Sales', 'Avg Sale (NGN)', 'Revenue (NGN)'])}</thead><tbody>
        ${staffData.rows.map((r, i) => trR([i + 1, r.staffName, r.branchName, r.salesCount, fmtCurrency(Math.round(r.avgSaleValue)), fmtCurrency(r.totalRevenue)])).join('')}
        </tbody><tfoot><tr><td colspan="3"><strong>Total</strong></td><td class="td-right"><strong>${staffData.rows.reduce((s, r) => s + r.salesCount, 0)}</strong></td><td></td><td class="td-right"><strong>${fmtCurrency(staffData.rows.reduce((s, r) => s + r.totalRevenue, 0))}</strong></td></tr></tfoot></table>`;
    }
    openPrintWindow(`${title} — ${period}`, `${period} · ${branchName}`, tableHtml);
  };

  const isLoading = {
    sales: salesLoading,
    expenses: expensesLoading,
    inventory: inventoryLoading,
    products: productsLoading,
    customers: customersLoading,
    staff: staffLoading,
  }[activeTab];

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500 text-sm mt-0.5">Business intelligence across all areas</p>
          </div>
          <DownloadBar
            onCsv={csvHandlers[activeTab]}
            onPdf={handlePdf}
            disabled={isLoading}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 no-print">
          <div className="flex flex-wrap gap-3 items-center">
            {isGlobalView && (
              <select
                value={selectedBranchId ?? ''}
                onChange={(e) => setSelectedBranchId(e.target.value ? Number(e.target.value) : undefined)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
            <div className="flex gap-1 flex-wrap">
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
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden no-print">
          <div className="flex overflow-x-auto border-b border-gray-100">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className={`fa-solid ${tab.icon} text-xs`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* SALES TAB */}
          {activeTab === 'sales' && (
            <div className="space-y-4">
              {salesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 h-24 animate-pulse border border-gray-100" />
                  ))}
                </div>
              ) : salesData ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="Total Revenue" value={fmtCurrency(salesData.summary.totalRevenue)} sub={`${salesData.summary.totalSales} sales`} colorClass="bg-emerald-500" icon="fa-arrow-trend-up" />
                    <StatCard label="Avg Order" value={fmtCurrency(salesData.summary.avgOrderValue)} colorClass="bg-indigo-500" icon="fa-calculator" />
                    <StatCard label="Outstanding" value={fmtCurrency(salesData.summary.outstandingAmount)} sub="pending + partial" colorClass="bg-amber-500" icon="fa-clock" />
                    <StatCard label="Fully Paid" value={String(salesData.summary.paidCount)} sub={`of ${salesData.summary.totalSales} sales`} colorClass="bg-violet-500" icon="fa-circle-check" />
                  </div>

                  {salesData.byBranch.length > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700">By Branch</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Branch</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Sales</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {salesData.byBranch.map((b) => (
                              <tr key={b.branchName} className="hover:bg-gray-50">
                                <td className="px-5 py-3 text-sm text-gray-800">{b.branchName}</td>
                                <td className="px-5 py-3 text-sm text-gray-600 text-right">{b.salesCount}</td>
                                <td className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">{fmtCurrency(b.revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">All Sales ({salesData.rows.length})</h3>
                    </div>
                    {salesData.rows.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-10">No sales in this period</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Sale #</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Branch</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Sold By</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {salesData.rows.map((r, i) => (
                              <tr key={r.id} className={`hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                                <td className="px-5 py-3 text-sm font-medium text-indigo-600">{r.saleNumber}</td>
                                <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">{fmtDate(r.soldAt)}</td>
                                <td className="px-5 py-3 text-sm text-gray-700">{r.customerName}</td>
                                <td className="px-5 py-3 text-sm text-gray-700">{r.branchName}</td>
                                <td className="px-5 py-3 text-sm text-gray-700">{r.soldByName}</td>
                                <td className="px-5 py-3">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_STATUS_STYLES[r.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                                    {r.paymentStatus}
                                  </span>
                                </td>
                                <td className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">{fmtCurrency(r.totalAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-gray-200 bg-gray-50">
                              <td colSpan={6} className="px-5 py-3 text-sm font-semibold text-gray-700">Total</td>
                              <td className="px-5 py-3 text-sm font-bold text-gray-900 text-right">{fmtCurrency(salesData.summary.totalRevenue)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* EXPENSES TAB */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {expensesLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 h-24 animate-pulse border border-gray-100" />
                  ))}
                </div>
              ) : expensesData ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard label="Total Expenses" value={fmtCurrency(expensesData.summary.totalExpenses)} sub={`${expensesData.summary.totalCount} records`} colorClass="bg-rose-500" icon="fa-receipt" />
                    <StatCard label="Categories" value={String(expensesData.byCategory.length)} sub="spending categories" colorClass="bg-violet-500" icon="fa-tag" />
                    {expensesData.byCategory[0] && (
                      <StatCard
                        label="Top Category"
                        value={EXPENSE_CATEGORY_LABELS[expensesData.byCategory[0].category as ExpenseCategory] ?? expensesData.byCategory[0].category}
                        sub={fmtCurrency(expensesData.byCategory[0].amount)}
                        colorClass="bg-amber-500"
                        icon="fa-chart-pie"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700">By Category</h3>
                      </div>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Count</th>
                            <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {expensesData.byCategory.map((c) => (
                            <tr key={c.category} className="hover:bg-gray-50">
                              <td className="px-5 py-3 text-sm text-gray-800">{EXPENSE_CATEGORY_LABELS[c.category as ExpenseCategory] ?? c.category}</td>
                              <td className="px-5 py-3 text-sm text-gray-500 text-right">{c.count}</td>
                              <td className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">{fmtCurrency(c.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {expensesData.byBranch.length > 1 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-700">By Branch</h3>
                        </div>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Branch</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Count</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {expensesData.byBranch.map((b) => (
                              <tr key={b.branchName} className="hover:bg-gray-50">
                                <td className="px-5 py-3 text-sm text-gray-800">{b.branchName}</td>
                                <td className="px-5 py-3 text-sm text-gray-500 text-right">{b.count}</td>
                                <td className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">{fmtCurrency(b.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700">All Expenses ({expensesData.rows.length})</h3>
                    </div>
                    {expensesData.rows.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-10">No expenses in this period</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Branch</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Recorded By</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {expensesData.rows.map((r, i) => (
                              <tr key={r.id} className={`hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                                <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">{fmtDate(r.date)}</td>
                                <td className="px-5 py-3 text-sm text-gray-800">{r.description || '—'}</td>
                                <td className="px-5 py-3 text-sm text-gray-700">{EXPENSE_CATEGORY_LABELS[r.category as ExpenseCategory] ?? r.category}</td>
                                <td className="px-5 py-3 text-sm text-gray-700">{r.branchName}</td>
                                <td className="px-5 py-3 text-sm text-gray-700">{r.recordedByName}</td>
                                <td className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">{fmtCurrency(r.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-gray-200 bg-gray-50">
                              <td colSpan={5} className="px-5 py-3 text-sm font-semibold text-gray-700">Total</td>
                              <td className="px-5 py-3 text-sm font-bold text-gray-900 text-right">{fmtCurrency(expensesData.summary.totalExpenses)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {inventoryLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 h-24 animate-pulse border border-gray-100" />
                  ))}
                </div>
              ) : inventoryData ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="Total Items" value={fmt(inventoryData.summary.totalItems)} colorClass="bg-indigo-500" icon="fa-layer-group" />
                    <StatCard label="Total Stock" value={fmt(inventoryData.summary.totalStock)} sub="units across warehouses" colorClass="bg-emerald-500" icon="fa-boxes-stacked" />
                    <StatCard label="Low Stock" value={String(inventoryData.summary.lowStockCount)} sub="at or below reorder level" colorClass="bg-amber-500" icon="fa-triangle-exclamation" />
                    <StatCard label="Out of Stock" value={String(inventoryData.summary.outOfStockCount)} colorClass="bg-red-500" icon="fa-ban" />
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700">All Inventory ({inventoryData.rows.length} items)</h3>
                    </div>
                    {inventoryData.rows.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-10">No inventory records</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Variant</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Branch</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Available</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Min</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {inventoryData.rows.map((r, i) => (
                              <tr key={i} className={`hover:bg-gray-50 ${r.isLowStock ? 'bg-red-50/30' : i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                                <td className="px-5 py-3 text-sm text-gray-800 font-medium">{r.productName}</td>
                                <td className="px-5 py-3 text-sm text-gray-700">{r.variantName}</td>
                                <td className="px-5 py-3 text-sm text-gray-600">{r.warehouseName}</td>
                                <td className="px-5 py-3 text-sm text-gray-600">{r.branchName}</td>
                                <td className="px-5 py-3 text-sm text-gray-900 text-right font-medium">{r.totalQuantity}</td>
                                <td className="px-5 py-3 text-sm text-gray-900 text-right font-semibold">{r.availableQuantity}</td>
                                <td className="px-5 py-3 text-sm text-gray-400 text-right">{r.minimumQuantity}</td>
                                <td className="px-5 py-3">
                                  {r.isLowStock ? (
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Low Stock</span>
                                  ) : r.totalQuantity === 0 ? (
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">Empty</span>
                                  ) : (
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">OK</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {productsLoading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 h-24 animate-pulse border border-gray-100" />
                  ))}
                </div>
              ) : productsData ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard label="Total Revenue" value={fmtCurrency(productsData.summary.totalRevenue)} colorClass="bg-emerald-500" icon="fa-arrow-trend-up" />
                    <StatCard label="Units Sold" value={fmt(productsData.summary.totalUnitsSold)} colorClass="bg-indigo-500" icon="fa-cubes" />
                    <StatCard label="Products" value={String(productsData.summary.totalProductsSold)} sub="with sales in period" colorClass="bg-violet-500" icon="fa-box" />
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700">Products by Revenue</h3>
                    </div>
                    {productsData.rows.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-10">No sales in this period</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Variant</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Orders</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {productsData.rows.map((r, i) => (
                              <tr key={i} className={`hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                                <td className="px-5 py-3 text-sm font-bold text-gray-400">{i + 1}</td>
                                <td className="px-5 py-3 text-sm text-gray-800 font-medium">{r.productName}</td>
                                <td className="px-5 py-3 text-sm text-gray-600">{r.variantName}</td>
                                <td className="px-5 py-3 text-sm text-gray-600 text-right">{r.orderCount}</td>
                                <td className="px-5 py-3 text-sm text-gray-900 text-right font-medium">{fmt(r.totalQtySold)}</td>
                                <td className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">{fmtCurrency(r.totalRevenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-gray-200 bg-gray-50">
                              <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-gray-700">Total</td>
                              <td className="px-5 py-3 text-sm font-bold text-gray-900 text-right">{fmt(productsData.summary.totalUnitsSold)}</td>
                              <td className="px-5 py-3 text-sm font-bold text-gray-900 text-right">{fmtCurrency(productsData.summary.totalRevenue)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              {customersLoading ? (
                <TableSkeleton cols={4} />
              ) : customersData ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Total Customers" value={String(customersData.summary.totalCustomers)} colorClass="bg-indigo-500" icon="fa-users" />
                    <StatCard label="Total Outstanding" value={fmtCurrency(customersData.summary.totalOutstanding)} sub="across all customers" colorClass="bg-amber-500" icon="fa-hand-holding-dollar" />
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700">Customers by Revenue (this period)</h3>
                    </div>
                    {customersData.rows.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-10">No customers found</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Orders</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Credit Limit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {customersData.rows.map((r, i) => (
                              <tr key={r.id} className={`hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                                <td className="px-5 py-3 text-sm text-gray-800 font-medium">{r.name}</td>
                                <td className="px-5 py-3 text-sm text-gray-500">{r.email}</td>
                                <td className="px-5 py-3 text-sm text-gray-500">{r.phone}</td>
                                <td className="px-5 py-3 text-sm text-gray-600 text-right">{r.totalOrders}</td>
                                <td className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">{fmtCurrency(r.totalRevenue)}</td>
                                <td className={`px-5 py-3 text-sm font-medium text-right ${r.outstandingBalance > 0 ? 'text-amber-700' : 'text-gray-400'}`}>
                                  {fmtCurrency(r.outstandingBalance)}
                                </td>
                                <td className="px-5 py-3 text-sm text-gray-500 text-right">{fmtCurrency(r.creditLimit)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* STAFF TAB */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              {staffLoading ? (
                <TableSkeleton cols={5} />
              ) : staffData ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">Staff Sales Performance</h3>
                  </div>
                  {staffData.rows.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">No data found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Staff</th>
                            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Branch</th>
                            <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Sales</th>
                            <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Avg Sale</th>
                            <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {staffData.rows.map((r, i) => (
                            <tr key={i} className={`hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                              <td className="px-5 py-3 text-sm font-bold text-gray-400">{i + 1}</td>
                              <td className="px-5 py-3 text-sm text-gray-800 font-medium">{r.staffName}</td>
                              <td className="px-5 py-3 text-sm text-gray-600">{r.branchName}</td>
                              <td className="px-5 py-3 text-sm text-gray-600 text-right">{r.salesCount}</td>
                              <td className="px-5 py-3 text-sm text-gray-700 text-right">{fmtCurrency(Math.round(r.avgSaleValue))}</td>
                              <td className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">{fmtCurrency(r.totalRevenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gray-200 bg-gray-50">
                            <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-gray-700">Total</td>
                            <td className="px-5 py-3 text-sm font-bold text-gray-900 text-right">
                              {staffData.rows.reduce((s, r) => s + r.salesCount, 0)}
                            </td>
                            <td />
                            <td className="px-5 py-3 text-sm font-bold text-gray-900 text-right">
                              {fmtCurrency(staffData.rows.reduce((s, r) => s + r.totalRevenue, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
      </div>
    </Layout>
  );
}

export default Reports;
