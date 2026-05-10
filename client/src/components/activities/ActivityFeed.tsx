import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetActivitiesQuery } from '../../store/api/activitiesApi';
import { generateActivityText } from '../../utils/activityTextGenerator';
import type { Activity, ActivityType } from '../../types/activity';

// ── Per-type icon (uniform indigo colour) ────────────────────────────────────
const TYPE_ICONS: Record<ActivityType, string> = {
  SALE_CREATED:           'fa-receipt',
  SALE_CANCELLED:         'fa-ban',
  PAYMENT_RECORDED:       'fa-money-bill-wave',
  INVENTORY_ADJUSTED:     'fa-layer-group',
  INVENTORY_TRANSFERRED:  'fa-right-left',
  PRODUCT_CREATED:        'fa-box',
  BRANCH_CREATED:         'fa-building',
  WAREHOUSE_CREATED:      'fa-warehouse',
  CUSTOMER_CREATED:       'fa-user-plus',
  STAFF_REGISTERED:       'fa-id-card',
  SUPPLY_CREATED:         'fa-truck-fast',
  SUPPLY_FULFILLED:       'fa-circle-check',
  STAFF_TRANSFERRED:      'fa-right-left',
  EXPENSE_RECORDED:       'fa-money-bill-trend-up',
  CONTAINER_OFFLOADED:    'fa-box-open',
  STOCK_ADDED:            'fa-square-plus',
  STOCK_DEDUCTED:         'fa-square-minus',
};

// Maps entityType → base path for building entity links
const ENTITY_PATHS: Record<string, string> = {
  Sale:      '/sales',
  Product:   '/products',
  Branch:    '/branches',
  Warehouse: '/warehouses',
  Customer:  '/customers',
  Staff:     '/staff',
  Supply:    '/supplies',
};

function getEntityUrl(activity: Activity): string | null {
  const base = ENTITY_PATHS[activity.entityType];
  if (!base || !activity.entityId) return null;
  return `${base}/${activity.entityId}`;
}

// ── Type label ────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<ActivityType, string> = {
  SALE_CREATED: 'Sale Created',
  SALE_CANCELLED: 'Sale Cancelled',
  PAYMENT_RECORDED: 'Payment Recorded',
  INVENTORY_ADJUSTED: 'Inventory Adjusted',
  INVENTORY_TRANSFERRED: 'Inventory Transferred',
  PRODUCT_CREATED: 'Product Created',
  BRANCH_CREATED: 'Branch Created',
  WAREHOUSE_CREATED: 'Warehouse Created',
  CUSTOMER_CREATED: 'Customer Created',
  STAFF_REGISTERED: 'Staff Registered',
  SUPPLY_CREATED: 'Supply Created',
  SUPPLY_FULFILLED: 'Supply Fulfilled',
  STAFF_TRANSFERRED: 'Staff Transferred',
  EXPENSE_RECORDED: 'Expense Recorded',
  CONTAINER_OFFLOADED: 'Container Offloaded',
  STOCK_ADDED: 'Stock Added',
  STOCK_DEDUCTED: 'Stock Deducted',
};

// ── Single activity row ───────────────────────────────────────────────────────
function ActivityItem({ activity, isNew }: { activity: Activity; isNew: boolean }) {
  const icon = TYPE_ICONS[activity.type] ?? 'fa-bolt';
  const entityUrl = getEntityUrl(activity);
  const rawText = generateActivityText(activity);
  const actorText = activity.actorName
    ? `${activity.actorName} ${rawText.charAt(0).toLowerCase()}${rawText.slice(1)}`
    : rawText;

  return (
    <li className="mb-7 ml-6">
      <span className="absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 ring-4 ring-white">
        <i className={`fa-solid ${icon} text-xs text-indigo-500`} />
      </span>

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 leading-snug">
            {actorText}
            {isNew && <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-1.5 mb-0.5 align-middle" />}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <time className="text-xs text-gray-400">
              {new Date(activity.createdAt).toLocaleString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </time>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
              {TYPE_LABELS[activity.type] ?? activity.type}
            </span>
          </div>
        </div>

        {entityUrl && (
          <Link
            to={entityUrl}
            className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            View
            <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        )}
      </div>
    </li>
  );
}

// ── Feed (query + filters + list) ─────────────────────────────────────────────
interface ActivityFeedProps {
  fixedParams: {
    actorId?: number;
    branchId?: number;
    warehouseId?: number;
    entityType?: string;
    entityId?: number;
    variantId?: number;
  };
  lastViewedAt?: string;
}

const PAGE_SIZE = 20;

export function ActivityFeed({ fixedParams, lastViewedAt }: ActivityFeedProps) {
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState<ActivityType | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading, isFetching } = useGetActivitiesQuery({
    ...fixedParams,
    take: PAGE_SIZE,
    skip: page * PAGE_SIZE,
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as ActivityType | ''); setPage(0); }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All types</option>
              {(Object.keys(TYPE_LABELS) as ActivityType[]).map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input type="date" value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input type="date" value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {(typeFilter || dateFrom || dateTo) && (
            <div className="flex items-end">
              <button
                onClick={() => { setTypeFilter(''); setDateFrom(''); setDateTo(''); setPage(0); }}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {isLoading || isFetching ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="fa-solid fa-inbox text-gray-400 text-xl" />
            </div>
            <p className="text-gray-500">No activities found.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, data.total)} of {data.total} activities
              </span>
            </div>
            <ol className="relative border-l border-gray-200 ml-3.5">
              {data.data.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isNew={!!lastViewedAt && new Date(activity.createdAt) > new Date(lastViewedAt)}
                />
              ))}
            </ol>

          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-arrow-left" /> Previous
            </button>
            <div className="flex items-center gap-1">
              {(() => {
                const currentPage = page + 1;
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
                return pages.map((p, i) =>
                  typeof p === 'number' ? (
                    <button
                      key={i}
                      onClick={() => setPage(p - 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === p ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ) : (
                    <span key={i} className="px-2 text-gray-400">{p}</span>
                  )
                );
              })()}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
