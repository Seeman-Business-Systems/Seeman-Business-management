import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import usePageTitle from '../../hooks/usePageTitle';
import type { Warehouse } from '../../types/inventory';
import type { CreateWarehouseRequest } from '../../store/api/warehousesApi';
import { useGetBranchesQuery } from '../../store/api/branchesApi';
import { useToast } from '../../context/ToastContext';

interface WarehouseFormProps {
  title: string;
  initialData?: Warehouse;
  onSubmit: (data: CreateWarehouseRequest) => Promise<void>;
  isSubmitting: boolean;
  backUrl: string;
}

const warehouseTypeOptions = [
  { value: 1, label: 'Main Warehouse' },
  { value: 2, label: 'Regional' },
  { value: 3, label: 'Plaza' },
  { value: 4, label: 'Retail Store' },
  { value: 5, label: 'Garage' },
];

const warehouseStatusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
];

function WarehouseFormPage({ title, initialData, onSubmit, isSubmitting, backUrl }: WarehouseFormProps) {
  usePageTitle(title);
  const { showToast } = useToast();

  const [searchParams] = useSearchParams();
  const preselectedBranchId = searchParams.get('branchId');

  const [name, setName] = useState(initialData?.name ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [city, setCity] = useState(initialData?.city ?? '');
  const [state, setState] = useState(initialData?.state ?? '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber ?? '');
  const [warehouseType, setWarehouseType] = useState<number>(initialData?.warehouseType ?? 1);
  const [status, setStatus] = useState(initialData?.status ?? 'ACTIVE');
  const [branchId, setBranchId] = useState<string>(
    initialData?.branchId?.toString() ?? preselectedBranchId ?? ''
  );
  const [capacity, setCapacity] = useState<string>(initialData?.capacity?.toString() ?? '');

  const { data: branches = [] } = useGetBranchesQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { showToast('error', 'Name is required'); return; }
    if (!address.trim()) { showToast('error', 'Address is required'); return; }
    if (!city.trim()) { showToast('error', 'City is required'); return; }
    if (!state.trim()) { showToast('error', 'State is required'); return; }
    if (!phoneNumber.trim()) { showToast('error', 'Phone number is required'); return; }

    await onSubmit({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      phoneNumber: phoneNumber.trim(),
      warehouseType,
      status,
      branchId: branchId ? Number(branchId) : null,
      capacity: capacity ? Number(capacity) : null,
    });
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <Link to={backUrl} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <i className="fa-solid fa-arrow-left" />
          <span>Back</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">{title}</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Name <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Onitsha Central Warehouse" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Address <span className="text-red-500">*</span></label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City <span className="text-red-500">*</span></label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Onitsha" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>State <span className="text-red-500">*</span></label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Anambra" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
              <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+234-803-111-2222" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Type <span className="text-red-500">*</span></label>
                <select value={warehouseType} onChange={(e) => setWarehouseType(Number(e.target.value))} className={inputClass}>
                  {warehouseTypeOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                  {warehouseStatusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Branch <span className="text-gray-400 font-normal">(optional)</span></label>
                <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className={inputClass}>
                  <option value="">No branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Capacity <span className="text-gray-400 font-normal">(units, optional)</span></label>
                <input type="number" min="0" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 5000" className={inputClass} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link to={backUrl} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Save Warehouse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default WarehouseFormPage;
