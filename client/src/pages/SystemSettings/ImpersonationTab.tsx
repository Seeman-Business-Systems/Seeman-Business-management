import { useState } from 'react';
import { useGetStaffListQuery } from '../../store/api/staffApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import type { Staff } from '../../types/auth';

function ImpersonationTab() {
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const { impersonate } = useAuth();
  const { showToast } = useToast();

  const { data, isLoading } = useGetStaffListQuery({ take: 1000 });

  const staff = (data?.data ?? []).filter((s: Staff) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      (s.phoneNumber ?? '').toLowerCase().includes(q) ||
      (s.email ?? '').toLowerCase().includes(q)
    );
  });

  const handleImpersonate = async (staffId: number, name: string) => {
    setLoadingId(staffId);
    try {
      const { data: result } = await api.post(`/auth/impersonate/${staffId}`);
      impersonate(result.accessToken, result.staff);
      showToast('success', `Now viewing as ${name}`);
    } catch {
      showToast('error', 'Failed to impersonate staff');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Log in as another staff member to see the system from their perspective. Your session is preserved and you can exit at any time.
      </p>

      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
        </div>
      ) : staff.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">No staff found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left font-semibold text-gray-700 py-2 pr-4">Name</th>
                <th className="text-left font-semibold text-gray-700 py-2 pr-4">Role</th>
                <th className="text-left font-semibold text-gray-700 py-2 pr-4">Branch</th>
                <th className="text-left font-semibold text-gray-700 py-2 pr-4">Phone</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {staff.map((s: Staff) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 pr-4 font-medium text-gray-800">
                    {s.firstName} {s.middleName ? `${s.middleName} ` : ''}{s.lastName}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600">{(s as any).role?.name ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{(s as any).branch?.name ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{s.phoneNumber}</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => handleImpersonate(s.id, `${s.firstName} ${s.lastName}`)}
                      disabled={loadingId === s.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {loadingId === s.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-indigo-600" />
                      ) : (
                        <i className="fa-solid fa-user-secret" />
                      )}
                      Login as
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ImpersonationTab;
