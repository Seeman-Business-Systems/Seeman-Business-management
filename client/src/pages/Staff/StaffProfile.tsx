import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetStaffQuery, useTransferStaffMutation } from '../../store/api/staffApi';
import { useGetBranchesQuery } from '../../store/api/branchesApi';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';

interface StaffProfileProps {
  staffId?: number;
  isMyprofile?: boolean;
}

function StaffProfile({ staffId: propStaffId, isMyprofile }: StaffProfileProps) {
  usePageTitle('Staff Profile');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Use prop staffId if provided, otherwise use URL param
  const staffId = propStaffId ?? (id ? Number(id) : undefined);

  const { data: staff, isLoading, error } = useGetStaffQuery(staffId!, {
    skip: !staffId,
  });

  const { showToast } = useToast();
  const { data: branches = [] } = useGetBranchesQuery();
  const [transferStaff, { isLoading: isTransferring }] = useTransferStaffMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferBranchId, setTransferBranchId] = useState('');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleTransfer = async () => {
    if (!staffId || !transferBranchId) return;
    try {
      await transferStaff({ id: staffId, branchId: Number(transferBranchId) }).unwrap();
      setShowTransferModal(false);
      setTransferBranchId('');
      showToast('success', 'Staff transferred successfully');
    } catch {
      showToast('error', 'Failed to transfer staff');
    }
  };

  const handleDelete = async () => {
    if (!staff) return;

    setIsDeleting(true);
    try {
      await api.delete(`/staff/${staff.id}`);
      setShowDeleteModal(false);
      navigate('/staff');
    } catch (err) {
      console.error('Failed to delete staff:', err);
    } finally {
      setIsDeleting(false);
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

  if (error || !staff) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <i className="fa-solid fa-user-slash text-2xl text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Staff not found</h2>
          <p className="text-gray-600 mt-2">
            The staff member you're looking for doesn't exist or has been removed.
          </p>
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
        {/* Back Button */}
        <Link
          to="/staff"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <i className="fa-solid fa-arrow-left" />
          <span>Back to Staff</span>
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl sm:text-3xl font-semibold text-indigo-600">
                  {staff.firstName.charAt(0)}
                  {staff.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {staff.fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {staff.role && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {staff.role.name}
                      {staff.role.isManagement && (
                        <i
                          className="fa-solid fa-star ml-1 text-indigo-500"
                          title="Management"
                        />
                      )}
                    </span>
                  )}
                  {staff.branch && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      <i className="fa-solid fa-building mr-1" />
                      {staff.branch.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to={`/staff/${staff.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <i className="fa-solid fa-pen-to-square" />
                Edit
              </Link>
              {!isMyprofile && (
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
                >
                  <i className="fa-solid fa-right-left" />
                  <span className="hidden sm:inline">Transfer</span>
                </button>
              )}
              <Link
                to={`/staff/${staff.id}/activities`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <i className="fa-solid fa-clock-rotate-left" />
                <span className="hidden sm:inline">View Activities</span>
                <span className="sm:hidden">Activities</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-address-book text-indigo-500" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-envelope text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">
                    {staff.email || (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
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
                    {staff.phoneNumber || (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-briefcase text-indigo-500" />
              Work Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-user-tie text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-medium">
                      {staff.role?.name || (
                        <span className="text-gray-400 italic">
                          Not assigned
                        </span>
                      )}
                    </p>
                    {staff.role?.isManagement && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        Management
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-building text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="text-gray-900 font-medium">
                    {staff.branch?.name || (
                      <span className="text-gray-400 italic">Not assigned</span>
                    )}
                  </p>
                  {staff.branch && (
                    <p className="text-sm text-gray-500">
                      {staff.branch.city}, {staff.branch.state}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-calendar-check text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="text-gray-900 font-medium">
                    {formatDate(staff.joinedAt)}
                  </p>
                </div>
              </div>
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
                  {formatDate(staff.createdAt)}
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
                  {formatDate(staff.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        {!isMyprofile && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2">
              Danger Zone
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Permanently delete this staff member. This action cannot be
              undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium cursor-pointer"
            >
              <i className="fa-solid fa-trash" />
              Delete Staff Member
            </button>
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => { setShowTransferModal(false); setTransferBranchId(''); }}
        title="Transfer Staff Member"
        leftButton={{ text: 'Cancel', onClick: () => { setShowTransferModal(false); setTransferBranchId(''); }, variant: 'secondary' }}
        rightButton={{ text: isTransferring ? 'Transferring…' : 'Transfer', onClick: handleTransfer, variant: 'primary' }}
      >
        <p className="text-gray-600 mb-4">
          Select the branch to transfer <span className="font-semibold text-gray-900">{staff.fullName}</span> to.
          Currently at <span className="font-semibold text-gray-900">{staff.branch?.name ?? '—'}</span>.
        </p>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Branch</label>
        <select
          value={transferBranchId}
          onChange={(e) => setTransferBranchId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a branch…</option>
          {branches
            .filter((b) => b.id !== staff.branch?.id)
            .map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
        </select>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Staff Member"
        leftButton={{
          text: 'Cancel',
          onClick: () => setShowDeleteModal(false),
          variant: 'secondary',
        }}
        rightButton={{
          text: isDeleting ? 'Deleting…' : 'Delete',
          onClick: handleDelete,
          variant: 'danger',
        }}
      >
        <p className="text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">{staff.fullName}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </Layout>
  );
}

export default StaffProfile;