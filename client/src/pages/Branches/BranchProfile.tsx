import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import usePageTitle from '../../hooks/usePageTitle';
import { BranchStatus } from '../../types/auth';
import { useGetBranchQuery, useDeleteBranchMutation } from '../../store/api/branchesApi';
import { useAuth } from '../../context/AuthContext';

const statusStyles: Record<string, string> = {
  [BranchStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [BranchStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
  [BranchStatus.SUSPENDED]: 'bg-red-100 text-red-800',
};

function BranchProfile() {
  usePageTitle('Branch Details');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const branchId = Number(id);
  const { can } = useAuth();
  const canEdit = can('branch:update');

  const { data: branch, isLoading, error } = useGetBranchQuery(branchId, {
    skip: !branchId,
  });

  const [deleteBranch, { isLoading: isDeleting }] = useDeleteBranchMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!branch) return;

    try {
      await deleteBranch(branch.id).unwrap();
      setShowDeleteModal(false);
      navigate('/branches');
    } catch (err) {
      console.error('Failed to delete branch:', err);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !branch) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <i className="fa-solid fa-building-circle-xmark text-2xl text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Branch not found</h2>
          <p className="text-gray-600 mt-2">
            The branch you're looking for doesn't exist or has been removed.
          </p>
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

  const totalStaff =
    (branch.staff?.manager?.length || 0) +
    (branch.staff?.salesReps?.length || 0) +
    (branch.staff?.apprentices?.length || 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          to="/branches"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <i className="fa-solid fa-arrow-left" />
          <span>Back to Branches</span>
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Branch Identity */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-building text-2xl sm:text-3xl text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {branch.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 font-mono">
                    {branch.code}
                  </span>
                  {branch.isHeadOffice && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      <i className="fa-solid fa-building mr-1" />
                      Head Office
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[branch.status]}`}
                  >
                    {branch.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to={`/warehouses?branchId=${branch.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <i className="fa-solid fa-warehouse" />
                <span className="hidden sm:inline">View Warehouses</span>
              </Link>
              <Link
                to={`/branches/${branch.id}/activities`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <i className="fa-solid fa-clock-rotate-left" />
                <span className="hidden sm:inline">View Activities</span>
              </Link>
              {canEdit && (
                <Link
                  to={`/branches/${branch.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <i className="fa-solid fa-pen-to-square" />
                  Edit
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Branch Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-indigo-500" />
              Branch Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-map-pin text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900 font-medium">{branch.address}</p>
                  <p className="text-sm text-gray-500">
                    {branch.city}, {branch.state}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-phone text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-900 font-medium">
                    {branch.phoneNumber || (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </p>
                </div>
              </div>
              {branch.altPhoneNumber && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-phone-flip text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Alternate Phone</p>
                    <p className="text-gray-900 font-medium">
                      {branch.altPhoneNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-user-tie text-indigo-500" />
              Management
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-user-shield text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Branch Manager</p>
                  <p className="text-gray-900 font-medium">
                    {branch.manager ? (
                      `${branch.manager.firstName} ${branch.manager.lastName}`
                    ) : (
                      <span className="text-gray-400 italic">Not assigned</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-user-plus text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="text-gray-900 font-medium">
                    {branch.createdBy ? (
                      `${branch.createdBy.firstName} ${branch.createdBy.lastName}`
                    ) : (
                      <span className="text-gray-400 italic">System</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <i className="fa-solid fa-users text-indigo-500" />
              Staff ({totalStaff})
            </h2>
            <Link
              to={`/staff?branchId=${branch.id}`}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View all staff <i className="fa-solid fa-arrow-right ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Managers */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-user-tie text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">
                  Managers ({branch.staff?.manager?.length || 0})
                </span>
              </div>
              {branch.staff?.manager?.length > 0 ? (
                <ul className="space-y-1">
                  {branch.staff.manager.map((m) => (
                    <li key={m.id} className="text-sm text-indigo-700">
                      {m.fullName}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-indigo-400 italic">None</p>
              )}
            </div>

            {/* Sales Reps */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-handshake text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Sales Reps ({branch.staff?.salesReps?.length || 0})
                </span>
              </div>
              {branch.staff?.salesReps?.length > 0 ? (
                <ul className="space-y-1">
                  {branch.staff.salesReps.map((s) => (
                    <li key={s.id} className="text-sm text-green-700">
                      {s.fullName}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-400 italic">None</p>
              )}
            </div>

            {/* Apprentices */}
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-user-graduate text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  Apprentices ({branch.staff?.apprentices?.length || 0})
                </span>
              </div>
              {branch.staff?.apprentices?.length > 0 ? (
                <ul className="space-y-1">
                  {branch.staff.apprentices.map((a) => (
                    <li key={a.id} className="text-sm text-amber-700">
                      {a.fullName}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-amber-400 italic">None</p>
              )}
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-indigo-500" />
            System Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-plus text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-gray-900 font-medium">
                  {formatDate(branch.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-rotate text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-gray-900 font-medium">
                  {formatDate(branch.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        {canEdit && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-500 mb-4">
              Permanently delete this branch. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium cursor-pointer"
            >
              <i className="fa-solid fa-trash" />
              Delete Branch
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Branch"
        leftButton={{
          text: 'Cancel',
          onClick: () => setShowDeleteModal(false),
          variant: 'secondary',
        }}
        rightButton={{
          text: isDeleting ? 'Deleting...' : 'Delete',
          onClick: handleDelete,
          variant: 'danger',
        }}
      >
        <p className="text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">{branch.name}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </Layout>
  );
}

export default BranchProfile;
