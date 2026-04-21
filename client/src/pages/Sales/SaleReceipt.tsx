import { useParams } from 'react-router-dom';
import { useGetSaleQuery } from '../../store/api/salesApi';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SaleReceipt() {
  const { id } = useParams<{ id: string }>();
  const { data: sale, isLoading } = useGetSaleQuery(Number(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Sale not found
      </div>
    );
  }

  const totalPaid = sale.payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.max(0, sale.totalAmount - totalPaid);

  return (
    <>
      {/* Print controls - hidden when printing */}
      <div className="print:hidden bg-gray-100 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="text-sm text-gray-600">Receipt — {sale.saleNumber}</span>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-print" />
          Print / Save as PDF
        </button>
      </div>

      {/* Receipt content */}
      <div className="min-h-screen bg-gray-100 print:bg-white py-8 print:py-0">
        <div className="max-w-sm mx-auto bg-white shadow-sm print:shadow-none print:max-w-none p-8">
          {/* Header */}
          <div className="text-center border-b border-gray-200 pb-4 mb-4">
            <img src="/full-logo.png" alt="Seeman" className="h-10 mx-auto mb-2" />
            <h1 className="text-base font-bold text-gray-900">Seeman Auto & Agro Ind. Ltd.</h1>
            <p className="text-sm text-gray-600 mt-0.5">{sale.branch?.name ?? ''}</p>
            {sale.branch?.address && (
              <p className="text-xs text-gray-500 mt-0.5">
                {sale.branch.address}{sale.branch.city ? `, ${sale.branch.city}` : ''}{sale.branch.state ? `, ${sale.branch.state}` : ''}
              </p>
            )}
            {sale.branch?.phoneNumber && (
              <p className="text-xs text-gray-500 mt-0.5">Tel: {sale.branch.phoneNumber}</p>
            )}
          </div>

          {/* Receipt title & number */}
          <div className="text-center mb-4">
            <h2 className="text-base font-semibold text-gray-800">RECEIPT</h2>
            <p className="text-sm font-mono text-gray-600 mt-0.5">{sale.saleNumber}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(sale.soldAt)}</p>
          </div>

          {/* Customer & cashier */}
          <div className="border-t border-dashed border-gray-300 pt-3 mb-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer:</span>
              <span className="text-gray-900 font-medium">
                {sale.customer ? sale.customer.name : 'Walk-in Customer'}
              </span>
            </div>
            {sale.customer?.phoneNumber && (
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">Phone:</span>
                <span className="text-gray-700">{sale.customer.phoneNumber}</span>
              </div>
            )}
            <div className="flex justify-between mt-1">
              <span className="text-gray-500">Cashier:</span>
              <span className="text-gray-700">
                {sale.soldBy ? `${sale.soldBy.firstName} ${sale.soldBy.lastName}` : '—'}
              </span>
            </div>
          </div>

          {/* Line items */}
          <div className="border-t border-dashed border-gray-300 pt-3 mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1 text-xs font-medium text-gray-500">Item</th>
                  <th className="text-center py-1 text-xs font-medium text-gray-500">Qty</th>
                  <th className="text-right py-1 text-xs font-medium text-gray-500">Price</th>
                  <th className="text-right py-1 text-xs font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-1.5">
                      <p className="text-gray-900 text-xs">{item.variantName}</p>
                      {item.discountAmount > 0 && (
                        <p className="text-gray-400 text-xs">Disc: -{formatPrice(item.discountAmount)}</p>
                      )}
                    </td>
                    <td className="py-1.5 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-1.5 text-right text-gray-700">{formatPrice(item.unitPrice)}</td>
                    <td className="py-1.5 text-right font-medium text-gray-900">{formatPrice(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-dashed border-gray-300 pt-3 mb-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(sale.subtotal)}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-gray-600 mt-1">
                <span>Discount</span>
                <span>-{formatPrice(sale.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 mt-2 text-base">
              <span>TOTAL</span>
              <span>{formatPrice(sale.totalAmount)}</span>
            </div>
          </div>

          {/* Payment info */}
          <div className="border-t border-dashed border-gray-300 pt-3 mb-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Payment Method</span>
              <span>{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-gray-600 mt-1">
              <span>Amount Paid</span>
              <span className="text-green-600 font-medium">{formatPrice(totalPaid)}</span>
            </div>
            {balanceDue > 0 && (
              <div className="flex justify-between text-red-600 font-medium mt-1">
                <span>Balance Due</span>
                <span>{formatPrice(balanceDue)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-dashed border-gray-300 pt-4 text-center">
            <p className="text-xs text-gray-500">Thank you for your patronage!</p>
            <p className="text-xs text-gray-400 mt-1">Payment Status: {sale.paymentStatus}</p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
        }
      `}</style>
    </>
  );
}

export default SaleReceipt;
