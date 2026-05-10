import { useState, useEffect } from 'react';
import type { Staff } from '../../types/auth';
import useRoles from '../../hooks/useRoles';
import useBranches from '../../hooks/useBranches';
import { useAuth } from '../../context/AuthContext';

export interface StaffFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  email: string;
  roleId: number | '';
  branchId: number | '';
  joinedAt: string;
}

interface StaffFormProps {
  initialData?: Partial<Staff>;
  onSubmit: (data: StaffFormData) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
}

function StaffForm({ initialData, onSubmit, submitLabel, isSubmitting }: StaffFormProps) {
  const { roles, isLoading: rolesLoading } = useRoles();
  const { branches, isLoading: branchesLoading } = useBranches();
  const { user, can } = useAuth();
  const canSelectBranch = can('branch:select-on-create');
  const loadingOptions = rolesLoading || branchesLoading;

  const [formData, setFormData] = useState<StaffFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    phoneNumber: '',
    email: '',
    roleId: '',
    branchId: !canSelectBranch && user?.branch?.id ? user.branch.id : '',
    joinedAt: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        middleName: initialData.middleName || '',
        phoneNumber: initialData.phoneNumber || '',
        email: initialData.email || '',
        roleId: initialData.role?.id || '',
        branchId: initialData.branch?.id || '',
        joinedAt: initialData.joinedAt ? initialData.joinedAt.split('T')[0] : '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof StaffFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StaffFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?\d{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10-15 digits';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }
    if (!formData.branchId) {
      newErrors.branchId = 'Branch is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Section */}
      <p className="text-sm text-gray-500">
        Fields marked with <span className="text-red-500">*</span> are required
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
              errors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Middle Name
          </label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            placeholder="Enter middle name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
              errors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Contact Section */}
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
            placeholder="08090878765"
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="email@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Role and Branch Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white ${
              errors.roleId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select a role</option>
            {roles.filter((role) => !role.isManagement).map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.roleId && (
            <p className="mt-1 text-sm text-red-500">{errors.roleId}</p>
          )}
        </div>

        {canSelectBranch ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              name="branchId"
              value={formData.branchId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white ${
                errors.branchId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            {errors.branchId && (
              <p className="mt-1 text-sm text-red-500">{errors.branchId}</p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            {user?.branch ? (
              <p className="text-xs text-gray-500 py-2">
                Branch: <span className="font-medium text-gray-700">{user.branch.name}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-400 py-2">No branch assigned</p>
            )}
          </div>
        )}
      </div>

      {/* Join Date */}
      <div className="max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Joined Date
        </label>
        <input
          type="date"
          name="joinedAt"
          value={formData.joinedAt}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default StaffForm;
