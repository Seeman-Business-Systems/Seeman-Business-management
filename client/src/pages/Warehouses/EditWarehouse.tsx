import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import WarehouseFormPage from './WarehouseForm';
import { useGetWarehouseQuery, useUpdateWarehouseMutation } from '../../store/api/warehousesApi';
import type { CreateWarehouseRequest } from '../../store/api/warehousesApi';
import { useToast } from '../../context/ToastContext';

function EditWarehouse() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const warehouseId = Number(id);
  const { showToast } = useToast();

  const { data: warehouse, isLoading } = useGetWarehouseQuery(warehouseId, { skip: !warehouseId });
  const [updateWarehouse, { isLoading: isUpdating }] = useUpdateWarehouseMutation();

  const handleSubmit = async (data: CreateWarehouseRequest) => {
    try {
      await updateWarehouse({ id: warehouseId, data }).unwrap();
      showToast('success', 'Warehouse updated successfully');
      navigate(`/warehouses/${warehouseId}`);
    } catch {
      showToast('error', 'Failed to update warehouse');
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

  if (!warehouse) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-500">Warehouse not found</div>
      </Layout>
    );
  }

  return (
    <WarehouseFormPage
      title="Edit Warehouse"
      initialData={warehouse}
      onSubmit={handleSubmit}
      isSubmitting={isUpdating}
      backUrl={`/warehouses/${warehouseId}`}
    />
  );
}

export default EditWarehouse;
