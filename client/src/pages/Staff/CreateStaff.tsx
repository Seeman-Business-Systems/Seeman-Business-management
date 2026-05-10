import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import StaffForm, { type StaffFormData } from './StaffForm';
import usePageTitle from '../../hooks/usePageTitle';
import api from '../../lib/api';

function CreateStaff() {
  usePageTitle('Add Staff');
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || undefined,
        phoneNumber: data.phoneNumber,
        email: data.email,
        roleId: Number(data.roleId),
        branchId: Number(data.branchId),
        joinedAt: data.joinedAt ? new Date(data.joinedAt).toISOString() : undefined,
      });
      const fullName = [data.firstName, data.middleName, data.lastName]
        .filter(Boolean)
        .join(' ');
      const params = new URLSearchParams({
        name: fullName,
        email: data.email,
      });
      navigate(`/staff/created?${params.toString()}`);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to create staff member';
      setError(errorMessage || 'Failed to create staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/staff"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Staff Member</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <StaffForm
            onSubmit={handleSubmit}
            submitLabel="Create Staff"
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </Layout>
  );
}

export default CreateStaff;
