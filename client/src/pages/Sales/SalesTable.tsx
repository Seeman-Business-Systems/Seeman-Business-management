import { Link } from 'react-router-dom';
import type { Sale } from '../../types/sale';
import { SaleStatus, PaymentStatus, PaymentMethod } from '../../types/sale';

interface SalesTableProps {
  sales: Sale[];
  startIndex: number;
  endIndex: number;
  total: number;
  resultsPerPage: number;
  onResultsPerPageChange: (value: number) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: SaleStatus }) {
  const config = {
    [SaleStatus.FULFILLED]: 'bg-green-100 text-green-700',
    [SaleStatus.DRAFT]: 'bg-yellow-100 text-yellow-700',
    [SaleStatus.CANCELLED]: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config[status]}`}>
      {status}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = {
    [PaymentStatus.PAID]: 'bg-green-100 text-green-700',
    [PaymentStatus.PARTIAL]: 'bg-yellow-100 text-yellow-700',
    [PaymentStatus.PENDING]: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config[status]}`}>
      {status}
    </span>
  );
}

function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const icons: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'fa-money-bill',
    [PaymentMethod.CARD]: 'fa-credit-card',
    [PaymentMethod.TRANSFER]: 'fa-building-columns',
    [PaymentMethod.CREDIT]: 'fa-clock',
  };
  return (
    <span className="inline-flex items-center gap-1 text-sm text-gray-700">
      <i className={`fa-solid ${icons[method]} text-gray-400 text-xs`} />
      {method}
    </span>
  );
}

function SalesTable({
  sales,
  startIndex,
  endIndex,
  total,
  resultsPerPage,
  onResultsPerPageChange,
}: SalesTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Results count and per page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {total > 0 ? startIndex + 1 : 0} – {endIndex} of {total} sales
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
        {sales.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">No sales found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sales.map((sale) => (
              <div key={sale.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/sales/${sale.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600 font-mono text-sm"
                    >
                      {sale.saleNumber}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(sale.soldAt)}</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {sale.customer ? sale.customer.name : 'Walk-in Customer'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge status={sale.status} />
                      <PaymentStatusBadge status={sale.paymentStatus} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-2">
                      {formatPrice(sale.totalAmount)}
                    </p>
                  </div>
                  <Link
                    to={`/sales/${sale.id}`}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600"
                  >
                    <i className="fa-solid fa-chevron-right text-xs" />
                  </Link>
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
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Sale #</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Customer</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden lg:table-cell">Items</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Total</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Payment</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden lg:table-cell">Method</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="w-12 px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  No sales found
                </td>
              </tr>
            ) : (
              sales.map((sale, index) => (
                <tr
                  key={sale.id}
                  className={`border-b border-gray-100 hover:bg-indigo-50 ${
                    index % 2 === 0 ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <Link
                      to={`/sales/${sale.id}`}
                      className="font-mono text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {sale.saleNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(sale.soldAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {sale.customer ? sale.customer.name : (
                        <span className="text-gray-400 italic">Walk-in</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm text-gray-700">
                      {sale.itemCount ?? sale.lineItems?.length ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(sale.totalAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <PaymentStatusBadge status={sale.paymentStatus} />
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <PaymentMethodBadge method={sale.paymentMethod} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={sale.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/sales/${sale.id}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600"
                    >
                      <i className="fa-solid fa-chevron-right text-xs" />
                    </Link>
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

export default SalesTable;
