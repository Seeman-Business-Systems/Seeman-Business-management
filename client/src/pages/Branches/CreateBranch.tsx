import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import BranchForm, { type BranchFormData } from './BranchForm';
import usePageTitle from '../../hooks/usePageTitle';
import { useCreateBranchMutation } from '../../store/api/branchesApi';
import { useToast } from '../../context/ToastContext';

function CreateBranch() {
  usePageTitle('Add Branch');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [createBranch, { isLoading: isSubmitting }] = useCreateBranchMutation();

  const handleSubmit = async (data: BranchFormData) => {
    try {
      await createBranch({
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
      showToast('success', `Branch "${data.name}" created successfully`);
      navigate('/branches');
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : 'Failed to create branch';
      showToast(
        'error',
        `An error occurred. Please try again. Error: ${errorMessage}`,
      );
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Add Branch</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <BranchForm
            onSubmit={handleSubmit}
            submitLabel="Create Branch"
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </Layout>
  );
}

export default CreateBranch;
