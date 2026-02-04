import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import StaffForm, { type StaffFormData } from './StaffForm';
import usePageTitle from '../../hooks/usePageTitle';
import api from '../../lib/api';
import type { Staff } from '../../types/auth';

function EditStaff() {
  usePageTitle('Edit Staff');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get(`/staff/${id}`);
        setStaff(response.data);
      } catch (err) {
        console.error('Failed to fetch staff:', err);
        setError('Failed to load staff member');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaff();
    }
  }, [id]);

  const handleSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await api.put(`/staff/${id}`, {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || undefined,
        phoneNumber: data.phoneNumber,
        email: data.email,
        roleId: Number(data.roleId),
        branchId: Number(data.branchId),
        joinedAt: data.joinedAt ? new Date(data.joinedAt).toISOString() : undefined,
      });
      navigate('/staff');
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to update staff member';
      setError(errorMessage || 'Failed to update staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!staff) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Staff not found</h2>
          <p className="text-gray-600 mt-2">The staff member you're looking for doesn't exist.</p>
          <Link
            to="/staff"
            className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-800"
          >
            <i className="fa-solid fa-arrow-left" />
            Back to Staff
          </Link>
        </div>
      </Layout>
    );
  }

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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Staff Member</h1>
            <p className="text-sm text-gray-500 mt-1">{staff.fullName}</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <StaffForm
            initialData={staff}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </Layout>
  );
}

export default EditStaff;
