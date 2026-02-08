import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import BranchForm, { type BranchFormData } from './BranchForm';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetBranchQuery, useUpdateBranchMutation } from '../../store/api/branchesApi';
import { useToast } from '../../context/ToastContext';

function EditBranch() {
  usePageTitle('Edit Branch');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const branchId = Number(id);

  const { data: branch, isLoading: loading, error: fetchError } = useGetBranchQuery(branchId, {
    skip: !branchId,
  });

  const { showToast } = useToast();
  const [updateBranch, { isLoading: isSubmitting }] = useUpdateBranchMutation();

  const handleSubmit = async (data: BranchFormData) => {
    try {
      await updateBranch({
        id: branchId,
        name: data.name,
        code: data.code || undefined,
        address: data.address,
        city: data.city,
        state: data.state,
        phoneNumber: data.phoneNumber,
        altPhoneNumber: data.altPhoneNumber || undefined,
        managerId: data.managerId ? Number(data.managerId) : undefined,
        isHeadOffice: data.isHeadOffice,
        status: data.status,
      }).unwrap();
      showToast('success', `Branch "${data.name}" updated successfully`);
      navigate('/branches');
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : 'Failed to update branch';
      showToast('error', `An error occurred. Please try again. Error: ${errorMessage}`);
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

  if (fetchError || !branch) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Branch not found</h2>
          <p className="text-gray-600 mt-2">The branch you're looking for doesn't exist.</p>
          <Link
            to="/branches"
            className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-800"
          >
            <i className="fa-solid fa-arrow-left" />
            Back to Branches
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
            to="/branches"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Branch</h1>
            <p className="text-sm text-gray-500 mt-1">{branch.name}</p>
          </div>
        </div>

          <BranchForm
            initialData={branch}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
          />
        </div>
    </Layout>
  );
}

export default EditBranch;
