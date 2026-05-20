import { useOutboxEntries } from '../../lib/offline/useOutbox';
import { useOnlineStatus } from '../../lib/offline/useOnlineStatus';
import { outbox } from '../../lib/offline/outbox';
import type { CreateSaleRequest } from '../../types/sale';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function lineTotal(body: CreateSaleRequest): number {
  const subtotal = body.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice - (item.discountAmount ?? 0),
    0,
  );
  return subtotal - (body.discountAmount ?? 0);
}

function PendingSalesCard() {
  const entries = useOutboxEntries('sale');
  const isOnline = useOnlineStatus();

  if (entries.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <i className="fa-solid fa-cloud-bolt text-amber-500" />
        <h2 className="text-sm font-semibold text-gray-800">
          Pending sales ({entries.length})
        </h2>
        <span className="text-xs text-gray-500">
          {isOnline ? 'syncing…' : 'will sync when online'}
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {entries.map((entry) => {
          const body = entry.body as unknown as CreateSaleRequest;
          const itemCount = body.lineItems.reduce((sum, i) => sum + i.quantity, 0);
          const failed = entry.status === 'failed';
          return (
            <div key={entry.id} className="py-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-gray-900">
                  {itemCount} item{itemCount === 1 ? '' : 's'} · {formatPrice(lineTotal(body))}
                </p>
                <p className="text-xs text-gray-500">
                  Created {new Date(entry.createdAt).toLocaleTimeString()}
                </p>
                {failed && entry.lastError && (
                  <p className="text-xs text-rose-600 mt-0.5">{entry.lastError}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    failed
                      ? 'bg-rose-100 text-rose-700'
                      : isOnline
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <i
                    className={`fa-solid ${
                      failed
                        ? 'fa-triangle-exclamation'
                        : isOnline
                          ? 'fa-cloud-arrow-up animate-pulse'
                          : 'fa-cloud-bolt'
                    }`}
                  />
                  {failed ? 'Failed' : isOnline ? 'Syncing…' : 'Saved offline'}
                </span>
                {failed && (
                  <button
                    onClick={() => outbox.remove(entry.id)}
                    className="text-xs text-gray-500 hover:text-rose-600 cursor-pointer"
                    title="Dismiss this failed sale"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PendingSalesCard;
