import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetCustomerQuery, useUpdateCustomerMutation, useDeleteCustomerMutation } from '../../store/api/customersApi';
import { useGetSalesQuery } from '../../store/api/salesApi';
import { useToast } from '../../context/ToastContext';
import { SaleStatus, PaymentStatus } from '../../types/sale';
import type { Customer, UpdateCustomerRequest } from '../../types/customer';

function formatPrice(n: number | string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(n));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const statusStyles: Record<SaleStatus, string> = {
  [SaleStatus.FULFILLED]: 'bg-green-100 text-green-700',
  [SaleStatus.CANCELLED]: 'bg-red-100 text-red-700',
  [SaleStatus.DRAFT]: 'bg-gray-100 text-gray-600',
};

const paymentStyles: Record<PaymentStatus, string> = {
  [PaymentStatus.PAID]: 'bg-green-100 text-green-700',
  [PaymentStatus.PARTIAL]: 'bg-yellow-100 text-yellow-700',
  [PaymentStatus.PENDING]: 'bg-red-100 text-red-700',
};

interface EditFormData {
  name: string;
  phoneNumber: string;
  email: string;
  companyName: string;
  altPhoneNumber: string;
  notes: string;
}

function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const customerId = Number(id);

  usePageTitle('Customer');

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);

  const { data: customer, isLoading } = useGetCustomerQuery(customerId);
  const { data: salesData, isLoading: salesLoading } = useGetSalesQuery({ customerId });
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  const sales = salesData?.data ?? [];
  const totalSpent = sales
    .filter((s) => s.status !== SaleStatus.CANCELLED)
    .reduce((sum, s) => sum + Number(s.totalAmount), 0);

  const openEdit = (c: Customer) => {
    setEditForm({
      name: c.name,
      phoneNumber: c.phoneNumber,
      email: c.email ?? '',
      companyName: c.companyName ?? '',
      altPhoneNumber: c.altPhoneNumber ?? '',
      notes: c.notes ?? '',
    });
    setShowEdit(true);
  };

  const handleSave = async () => {
    if (!editForm) return;
    const payload: UpdateCustomerRequest = {
      name: editForm.name,
      phoneNumber: editForm.phoneNumber,
      email: editForm.email || undefined,
      companyName: editForm.companyName || undefined,
      altPhoneNumber: editForm.altPhoneNumber || undefined,
      notes: editForm.notes || undefined,
    };
    try {
      await updateCustomer({ id: customerId, data: payload }).unwrap();
      showToast('success', 'Customer updated');
      setShowEdit(false);
    } catch {
      showToast('error', 'Failed to update customer');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCustomer(customerId).unwrap();
      showToast('success', 'Customer deleted');
      navigate('/customers');
    } catch {
      showToast('error', 'Failed to delete customer');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-gray-500">Customer not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/customers')}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{customer.name}</h1>
            {customer.companyName && (
              <p className="text-sm text-gray-500 mt-0.5">{customer.companyName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEdit(customer)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <i className="fa-solid fa-pen text-xs" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <i className="fa-solid fa-trash text-xs" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Customer details */}
          <div className="space-y-4">
            {/* Contact info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Contact</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-phone text-gray-400 w-4 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{customer.phoneNumber}</p>
                    {customer.altPhoneNumber && (
                      <p className="text-gray-500 mt-0.5">{customer.altPhoneNumber}</p>
                    )}
                  </div>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-envelope text-gray-400 w-4" />
                    <p className="text-gray-900 break-all">{customer.email}</p>
                  </div>
                )}
                {customer.companyName && (
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-building text-gray-400 w-4" />
                    <p className="text-gray-900">{customer.companyName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total purchases</span>
                  <span className="text-sm font-medium text-gray-900">
                    {sales.filter((s) => s.status !== SaleStatus.CANCELLED).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total spent</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(totalSpent)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                  <span className="text-sm text-gray-500">Outstanding balance</span>
                  {Number(customer.outstandingBalance) > 0 ? (
                    <span className="text-sm font-semibold text-red-600">{formatPrice(customer.outstandingBalance)}</span>
                  ) : (
                    <span className="text-sm font-medium text-green-600">Settled</span>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {customer.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Notes</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{customer.notes}</p>
              </div>
            )}
          </div>

          {/* Right: Purchase history */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  Purchase History
                  {sales.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-400">({sales.length} sale{sales.length !== 1 ? 's' : ''})</span>
                  )}
                </h2>
              </div>

              {salesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                </div>
              ) : sales.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-400">
                  <i className="fa-solid fa-receipt text-3xl mb-2" />
                  <p className="text-sm">No purchases yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sale #</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sales.map((sale) => (
                        <tr
                          key={sale.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/sales/${sale.id}`)}
                        >
                          <td className="px-4 py-3">
                            <Link
                              to={`/sales/${sale.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-mono text-xs font-medium text-indigo-600 hover:text-indigo-800"
                            >
                              {sale.saleNumber}
                            </Link>
                            <p className="text-xs text-gray-400 mt-0.5 sm:hidden">{formatDate(sale.soldAt)}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{formatDate(sale.soldAt)}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPrice(sale.totalAmount)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[sale.status]}`}>
                              {sale.status.charAt(0) + sale.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${paymentStyles[sale.paymentStatus]}`}>
                              {sale.paymentStatus.charAt(0) + sale.paymentStatus.slice(1).toLowerCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && editForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Edit Customer</h2>
              <button onClick={() => setShowEdit(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {(
                [
                  { field: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Full name' },
                  { field: 'phoneNumber', label: 'Phone', type: 'tel', required: true, placeholder: '+234...' },
                  { field: 'email', label: 'Email', type: 'email', required: false, placeholder: 'email@example.com' },
                  { field: 'companyName', label: 'Company', type: 'text', required: false, placeholder: 'Company name' },
                  { field: 'altPhoneNumber', label: 'Alt. Phone', type: 'tel', required: false, placeholder: 'Alternative number' },
                ] as { field: keyof EditFormData; label: string; type: string; required: boolean; placeholder: string }[]
              ).map(({ field, label, type, required, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={type}
                    value={editForm[field]}
                    onChange={(e) => setEditForm((prev) => prev ? { ...prev, [field]: e.target.value } : prev)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((prev) => prev ? { ...prev, notes: e.target.value } : prev)}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer">Cancel</button>
              <button
                onClick={handleSave}
                disabled={isUpdating || !editForm.name.trim() || !editForm.phoneNumber.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-trash text-red-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Delete Customer?</h3>
            <p className="text-sm text-gray-500 mb-5">This will not delete their sale history.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default CustomerProfile;
