import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetWarehousesQuery } from '../../store/api/warehousesApi';
import { useGetBranchQuery } from '../../store/api/branchesApi';
import { useAuth } from '../../context/AuthContext';

const warehouseTypeLabels: Record<number, string> = {
  1: 'Main Warehouse',
  2: 'Regional',
  3: 'Plaza',
  4: 'Retail Store',
};

const warehouseStatusStyles: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  UNDER_MAINTENANCE: 'bg-yellow-100 text-yellow-800',
};

function Warehouses() {
  usePageTitle('Warehouses');
  const { can } = useAuth();
  const canCreate = can('warehouse:create');
  const canUpdate = can('warehouse:update');

  const [searchParams] = useSearchParams();
  const branchIdParam = searchParams.get('branchId');
  const branchId = branchIdParam ? Number(branchIdParam) : undefined;

  const { data: warehouses = [], isLoading } = useGetWarehousesQuery(
    branchId ? { branchId } : undefined
  );

  const { data: branch } = useGetBranchQuery(branchId!, { skip: !branchId });

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
      <div className="space-y-4">
        {/* Back link when filtered by branch */}
        {branchId ? (
          <Link
            to={`/branches/${branchId}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i className="fa-solid fa-arrow-left" />
            <span>Back to Branch</span>
          </Link>
        ) : (
          <Link
            to="/branches"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i className="fa-solid fa-arrow-left" />
            <span>Back to Branches</span>
          </Link>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Warehouses</h1>
            {branch && (
              <p className="text-sm text-gray-500 mt-0.5">
                <i className="fa-solid fa-building mr-1" />
                {branch.name}
              </p>
            )}
          </div>
          {canCreate && (
            <Link
              to={branchId ? `/warehouses/new?branchId=${branchId}` : '/warehouses/new'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <i className="fa-solid fa-plus" />
              Add Warehouse
            </Link>
          )}
        </div>

        {/* Warehouse Grid */}
        {warehouses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="fa-solid fa-warehouse text-2xl text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">No warehouses found</p>
            {canCreate && (
              <Link
                to={branchId ? `/warehouses/new?branchId=${branchId}` : '/warehouses/new'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <i className="fa-solid fa-plus" />
                Add Warehouse
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {warehouses.map((w) => (
              <div key={w.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-warehouse text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{w.name}</p>
                      <p className="text-xs text-gray-500">{warehouseTypeLabels[w.warehouseType] ?? '—'}</p>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${warehouseStatusStyles[w.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {w.status}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-4 flex-1">
                  <p className="flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-gray-400 w-4 text-center" />
                    {w.city}, {w.state}
                  </p>
                  {w.capacity != null && (
                    <p className="flex items-center gap-2">
                      <i className="fa-solid fa-boxes-stacked text-gray-400 w-4 text-center" />
                      Capacity: {w.capacity}
                    </p>
                  )}
                  {w.phoneNumber && (
                    <p className="flex items-center gap-2">
                      <i className="fa-solid fa-phone text-gray-400 w-4 text-center" />
                      {w.phoneNumber}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/inventory?warehouseId=${w.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                  >
                    <i className="fa-solid fa-boxes-stacked" />
                    Inventory
                  </Link>
                  <Link
                    to={`/warehouses/${w.id}`}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    <i className="fa-solid fa-eye" />
                  </Link>
                  {canUpdate && (
                    <Link
                      to={`/warehouses/${w.id}/edit`}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      <i className="fa-solid fa-pen-to-square" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Warehouses;
