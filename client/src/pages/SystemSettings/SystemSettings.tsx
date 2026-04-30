import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import usePageTitle from '../../hooks/usePageTitle';
import PermissionsTab from './PermissionsTab';
import ImpersonationTab from './ImpersonationTab';

type Tab = 'permissions' | 'impersonation';

function SystemSettings() {
  usePageTitle('System Settings');
  const [activeTab, setActiveTab] = useState<Tab>('permissions');

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage role permissions and impersonate staff accounts</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            {([
              { key: 'permissions', label: 'Role Permissions', icon: 'fa-shield-halved' },
              { key: 'impersonation', label: 'Impersonation', icon: 'fa-user-secret' },
            ] as { key: Tab; label: string; icon: string }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className={`fa-solid ${tab.icon}`} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'permissions' && <PermissionsTab />}
            {activeTab === 'impersonation' && <ImpersonationTab />}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SystemSettings;
