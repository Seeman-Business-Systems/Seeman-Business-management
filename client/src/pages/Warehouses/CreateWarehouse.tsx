import { useNavigate, useSearchParams } from 'react-router-dom';
import WarehouseFormPage from './WarehouseForm';
import { useCreateWarehouseMutation } from '../../store/api/warehousesApi';
import type { CreateWarehouseRequest } from '../../store/api/warehousesApi';
import { useToast } from '../../context/ToastContext';

function CreateWarehouse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const branchIdParam = searchParams.get('branchId');
  const { showToast } = useToast();

  const [createWarehouse, { isLoading }] = useCreateWarehouseMutation();

  const handleSubmit = async (data: CreateWarehouseRequest) => {
    try {
      const warehouse = await createWarehouse(data).unwrap();
      showToast('success', 'Warehouse created successfully');
      navigate(`/warehouses/${warehouse.id}`);
    } catch {
      showToast('error', 'Failed to create warehouse');
    }
  };

  return (
    <WarehouseFormPage
      title="Add Warehouse"
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      backUrl={branchIdParam ? `/warehouses?branchId=${branchIdParam}` : '/warehouses'}
    />
  );
}

export default CreateWarehouse;
