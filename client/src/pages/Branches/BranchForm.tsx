import { useState, useEffect } from 'react';
import type { Branch, Staff } from '../../types/auth';
import { BranchStatus } from '../../types/auth';
import api from '../../lib/api';

export interface BranchFormData {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  altPhoneNumber: string;
  managerId: number | '';
  isHeadOffice: boolean;
  status: typeof BranchStatus[keyof typeof BranchStatus];
}

interface BranchFormProps {
  initialData?: Partial<Branch>;
  onSubmit: (data: BranchFormData) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
}

function BranchForm({ initialData, onSubmit, submitLabel, isSubmitting }: BranchFormProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    phoneNumber: '',
    altPhoneNumber: '',
    managerId: '',
    isHeadOffice: false,
    status: BranchStatus.ACTIVE,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BranchFormData, string>>>({});

  // Fetch staff for manager dropdown
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get<{ data: Staff[]; total: number }>('/staff?take=1000');
        setStaff(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Failed to fetch staff:', error);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaff();
  }, []);

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        phoneNumber: initialData.phoneNumber || '',
        altPhoneNumber: initialData.altPhoneNumber || '',
        managerId: initialData.managerId || '',
        isHeadOffice: initialData.isHeadOffice || false,
        status: initialData.status || BranchStatus.ACTIVE,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof BranchFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BranchFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Branch name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }
    if (formData.altPhoneNumber && !/^[0-9+\-\s()]+$/.test(formData.altPhoneNumber)) {
      newErrors.altPhoneNumber = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  if (loadingStaff) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-500">
        Fields marked with <span className="text-red-500">*</span> are required
      </p>

      {/* Branch Name and Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Lagos Head Office"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Code
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            placeholder="Auto-generated if left empty"
          />
          <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate from name</p>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
            errors.address ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="e.g., 123 Main Street"
        />
        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* City and State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
              errors.city ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Lagos"
          />
          {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
              errors.state ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Lagos State"
          />
          {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
        </div>
      </div>

      {/* Phone Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
              errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="08012345678"
          />
          {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alternate Phone Number
          </label>
          <input
            type="tel"
            name="altPhoneNumber"
            value={formData.altPhoneNumber}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
              errors.altPhoneNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Optional"
          />
          {errors.altPhoneNumber && <p className="mt-1 text-sm text-red-500">{errors.altPhoneNumber}</p>}
        </div>
      </div>

      {/* Manager and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Manager
          </label>
          <select
            name="managerId"
            value={formData.managerId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
          >
            <option value="">Select a manager (optional)</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName} {member.role ? `(${member.role.name})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
          >
            <option value={BranchStatus.ACTIVE}>Active</option>
            <option value={BranchStatus.INACTIVE}>Inactive</option>
            <option value={BranchStatus.SUSPENDED}>Suspended</option>
          </select>
        </div>
      </div>

      {/* Head Office Toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isHeadOffice"
          name="isHeadOffice"
          checked={formData.isHeadOffice}
          onChange={handleChange}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="isHeadOffice" className="text-sm font-medium text-gray-700 cursor-pointer">
          This is the Head Office
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default BranchForm;
