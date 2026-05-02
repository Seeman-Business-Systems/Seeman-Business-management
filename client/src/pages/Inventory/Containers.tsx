import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useGetContainersQuery } from '../../store/api/inventoryBatchApi';

function Containers() {
  const navigate = useNavigate();
  const [filterOffloaded, setFilterOffloaded] = useState<'all' | 'pending' | 'offloaded'>('all');

  const offloadedParam = filterOffloaded === 'pending' ? false : filterOffloaded === 'offloaded' ? true : undefined;
  const { data: containers = [], isLoading } = useGetContainersQuery({ offloaded: offloadedParam });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link to="/inventory" className="hover:text-indigo-600">Inventory</Link>
              <i className="fa-solid fa-chevron-right text-xs" />
              <span>Containers</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Containers</h1>
            <p className="text-sm text-gray-500 mt-1">Track incoming stock containers and offload them to inventory</p>
          </div>
          <Link
            to="/inventory/containers/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <i className="fa-solid fa-plus" />
            New Container
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filterOffloaded}
            onChange={(e) => setFilterOffloaded(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Offload</option>
            <option value="offloaded">Offloaded</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-gray-500">Loading containers...</div>
          ) : containers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <i className="fa-solid fa-ship text-4xl text-gray-200 mb-3 block" />
              <p className="text-gray-500">No containers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Container No.</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Warehouses</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Arrived</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Items</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {containers.map((c) => {
                    const warehouseNames = Array.from(
                      new Set((c.items ?? []).map((i) => i.warehouse?.name).filter(Boolean) as string[]),
                    );
                    return (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/inventory/containers/${c.id}`)}
                      className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{c.batchNumber}</p>
                        {c.notes && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{c.notes}</p>}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <p className="text-sm text-gray-700 truncate max-w-[200px]">
                          {warehouseNames.length === 0 ? '—' : warehouseNames.join(', ')}
                        </p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600">
                        {new Date(c.arrivedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-600">
                        {c.items?.length ?? '—'} variant{c.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4">
                        {c.isOffloaded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <i className="fa-solid fa-circle-check" /> Offloaded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <i className="fa-solid fa-clock" /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Containers;
