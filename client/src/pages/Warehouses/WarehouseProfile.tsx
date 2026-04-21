import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetWarehouseQuery, useDeleteWarehouseMutation } from '../../store/api/warehousesApi';

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

function WarehouseProfile() {
  usePageTitle('Warehouse Details');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const warehouseId = Number(id);

  const { data: warehouse, isLoading, error } = useGetWarehouseQuery(warehouseId, { skip: !warehouseId });
  const [deleteWarehouse, { isLoading: isDeleting }] = useDeleteWarehouseMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteWarehouse(warehouseId).unwrap();
      navigate('/warehouses');
    } catch {
      // error handled by toast elsewhere
    }
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

  if (error || !warehouse) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <i className="fa-solid fa-warehouse text-2xl text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Warehouse not found</h2>
          <Link to="/warehouses" className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-800">
            <i className="fa-solid fa-arrow-left" />
            Back to Warehouses
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Link to="/warehouses" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <i className="fa-solid fa-arrow-left" />
          <span>Back to Warehouses</span>
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-warehouse text-2xl text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{warehouse.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {warehouseTypeLabels[warehouse.warehouseType] ?? '—'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${warehouseStatusStyles[warehouse.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {warehouse.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/inventory?warehouseId=${warehouse.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <i className="fa-solid fa-boxes-stacked" />
                <span className="hidden sm:inline">View Inventory</span>
              </Link>
              <Link
                to={`/warehouses/${warehouse.id}/activities`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <i className="fa-solid fa-clock-rotate-left" />
                <span className="hidden sm:inline">View Activities</span>
              </Link>
              <Link
                to={`/warehouses/${warehouse.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <i className="fa-solid fa-pen-to-square" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-indigo-500" />
              Location
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-map-pin text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900 font-medium">{warehouse.address}</p>
                  <p className="text-sm text-gray-500">{warehouse.city}, {warehouse.state}</p>
                </div>
              </div>
              {warehouse.phoneNumber && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-phone text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">{warehouse.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-indigo-500" />
              Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Type</span>
                <span className="text-sm font-medium text-gray-900">{warehouseTypeLabels[warehouse.warehouseType] ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${warehouseStatusStyles[warehouse.status] ?? 'bg-gray-100 text-gray-700'}`}>
                  {warehouse.status}
                </span>
              </div>
              {warehouse.capacity != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Capacity</span>
                  <span className="text-sm font-medium text-gray-900">{warehouse.capacity.toLocaleString()} units</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">Permanently delete this warehouse. This action cannot be undone.</p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium cursor-pointer"
          >
            <i className="fa-solid fa-trash" />
            Delete Warehouse
          </button>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Warehouse"
        leftButton={{ text: 'Cancel', onClick: () => setShowDeleteModal(false), variant: 'secondary' }}
        rightButton={{ text: isDeleting ? 'Deleting...' : 'Delete', onClick: handleDelete, variant: 'danger' }}
      >
        <p className="text-gray-600">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{warehouse.name}</span>? This action cannot be undone.
        </p>
      </Modal>
    </Layout>
  );
}

export default WarehouseProfile;
