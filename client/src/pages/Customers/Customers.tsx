import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetCustomersQuery, useCreateCustomerMutation, useUpdateCustomerMutation, useDeleteCustomerMutation } from '../../store/api/customersApi';
import { useToast } from '../../context/ToastContext';
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../../types/customer';

function formatPrice(n: number | string) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(n));
}

interface CustomerFormData {
  name: string;
  phoneNumber: string;
  email: string;
  companyName: string;
  altPhoneNumber: string;
  notes: string;
}

const emptyForm: CustomerFormData = {
  name: '',
  phoneNumber: '',
  email: '',
  companyName: '',
  altPhoneNumber: '',
  notes: '',
};

function CustomerModal({
  customer,
  onClose,
  onSave,
  isSaving,
}: {
  customer: Customer | null;
  onClose: () => void;
  onSave: (data: CustomerFormData) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<CustomerFormData>(
    customer
      ? {
          name: customer.name,
          phoneNumber: customer.phoneNumber,
          email: customer.email ?? '',
          companyName: customer.companyName ?? '',
          altPhoneNumber: customer.altPhoneNumber ?? '',
          notes: customer.notes ?? '',
        }
      : emptyForm
  );

  const set = (field: keyof CustomerFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">{customer ? 'Edit Customer' : 'New Customer'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={set('name')} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
            <input type="tel" value={form.phoneNumber} onChange={set('phoneNumber')} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="+234..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input type="text" value={form.companyName} onChange={set('companyName')} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Company name (optional)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alt. Phone</label>
            <input type="tel" value={form.altPhoneNumber} onChange={set('altPhoneNumber')} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Alternative number (optional)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none" placeholder="Notes (optional)" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer">Cancel</button>
          <button
            onClick={() => onSave(form)}
            disabled={isSaving || !form.name.trim() || !form.phoneNumber.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Customers() {
  usePageTitle('Customers');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterBalance, setFilterBalance] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filters = {
    ...(search.trim() ? { name: search.trim() } : {}),
    ...(filterBalance ? { hasOutstandingBalance: true } : {}),
  };
  const { data: customers = [], isLoading } = useGetCustomersQuery(
    Object.keys(filters).length > 0 ? filters : undefined
  );
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  const handleSave = async (data: CustomerFormData) => {
    try {
      if (editingCustomer) {
        const payload: UpdateCustomerRequest = {
          name: data.name,
          phoneNumber: data.phoneNumber,
          email: data.email || undefined,
          companyName: data.companyName || undefined,
          altPhoneNumber: data.altPhoneNumber || undefined,
          notes: data.notes || undefined,
        };
        await updateCustomer({ id: editingCustomer.id, data: payload }).unwrap();
        showToast('success', 'Customer updated');
      } else {
        const payload: CreateCustomerRequest = {
          name: data.name,
          phoneNumber: data.phoneNumber,
          email: data.email || undefined,
          companyName: data.companyName || undefined,
          altPhoneNumber: data.altPhoneNumber || undefined,
          notes: data.notes || undefined,
        };
        await createCustomer(payload).unwrap();
        showToast('success', 'Customer created');
      }
      setShowModal(false);
      setEditingCustomer(null);
    } catch {
      showToast('error', editingCustomer ? 'Failed to update customer' : 'Failed to create customer');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCustomer(id).unwrap();
      showToast('success', 'Customer deleted');
      setDeletingId(null);
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

  return (
    <Layout>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500 mt-0.5">{customers.length} customer{customers.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => { setEditingCustomer(null); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <i className="fa-solid fa-plus" />
            New Customer
          </button>
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setFilterBalance((v) => !v)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                filterBalance
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className="fa-solid fa-circle-exclamation text-xs" />
              Outstanding Balance
              {filterBalance && <i className="fa-solid fa-xmark text-xs ml-1" />}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {customers.length === 0 ? (
            <div className="px-4 py-16 text-center text-gray-400">
              <i className="fa-solid fa-users text-4xl mb-3" />
              <p className="text-sm font-medium">No customers found</p>
              <p className="text-xs mt-1">Add your first customer to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Company</th>
                    {/* <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Credit Limit</th> */}
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Balance</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/customers/${c.id}`)}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 sm:hidden">{c.phoneNumber}</p>
                        {c.companyName && <p className="text-xs text-gray-400 mt-0.5 md:hidden">{c.companyName}</p>}
                        {Number(c.outstandingBalance) > 0 && (
                          <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 lg:hidden">
                            {formatPrice(Number(c.outstandingBalance))} owed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{c.phoneNumber}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c.companyName ?? '—'}</td>
                      {/* <td className="px-4 py-3 text-right text-gray-600 hidden lg:table-cell">{c.creditLimit > 0 ? formatPrice(c.creditLimit) : '—'}</td> */}
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        {Number(c.outstandingBalance) > 0 ? (
                          <span className="text-red-600 font-medium">{formatPrice(Number(c.outstandingBalance))}</span>
                        ) : (
                          <span className="text-gray-400">{formatPrice(0)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingCustomer(c); setShowModal(true); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                          >
                            <i className="fa-solid fa-pen text-xs" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeletingId(c.id); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                          >
                            <i className="fa-solid fa-trash text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => { setShowModal(false); setEditingCustomer(null); }}
          onSave={handleSave}
          isSaving={isCreating || isUpdating}
        />
      )}

      {/* Delete confirm */}
      {deletingId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-trash text-red-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Delete Customer?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
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

export default Customers;
