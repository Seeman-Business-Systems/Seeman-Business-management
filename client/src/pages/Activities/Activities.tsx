import { useState, useMemo } from 'react';
import Layout from '../../components/layout/Layout';
import { ActivityFeed } from '../../components/activities/ActivityFeed';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetBranchesQuery } from '../../store/api/branchesApi';
import { useGetStaffListQuery } from '../../store/api/staffApi';

function Activities() {
  usePageTitle('Activities');

  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedActor, setSelectedActor] = useState('');

  const { data: branches = [] } = useGetBranchesQuery();
  const { data: staffData } = useGetStaffListQuery();
  const allStaff = staffData?.data ?? [];

  // Group staff by branch for the dropdown
  const staffByBranch = useMemo(() => {
    const map = new Map<number, { branchName: string; members: typeof allStaff }>();
    for (const s of allStaff) {
      if (!s.branch) continue;
      const entry = map.get(s.branch.id) ?? { branchName: s.branch.name, members: [] };
      entry.members.push(s);
      map.set(s.branch.id, entry);
    }
    return Array.from(map.values()).sort((a, b) => a.branchName.localeCompare(b.branchName));
  }, [allStaff]);

  const fixedParams = {
    ...(selectedBranch ? { branchId: Number(selectedBranch) } : {}),
    ...(selectedActor ? { actorId: Number(selectedActor) } : {}),
  };

  // Key forces ActivityFeed to reset its internal page/type/date when branch or actor changes
  const feedKey = `${selectedBranch}-${selectedActor}`;

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Activities</h1>
        </div>

        {/* Branch + Staff filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Branch */}
            <div className="relative flex-1 min-w-[160px]">
              <select
                value={selectedBranch}
                onChange={(e) => { setSelectedBranch(e.target.value); setSelectedActor(''); }}
                className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
              >
                <option value="">All branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <i className="fa-solid fa-building absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            </div>

            {/* Staff — grouped by branch */}
            <div className="relative flex-1 min-w-[160px]">
              <select
                value={selectedActor}
                onChange={(e) => setSelectedActor(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
              >
                <option value="">All staff</option>
                {staffByBranch
                  .filter((g) => !selectedBranch || branches.find((b) => b.id === Number(selectedBranch))?.name === g.branchName)
                  .map((group) => (
                    <optgroup key={group.branchName} label={group.branchName}>
                      {group.members.map((s) => (
                        <option key={s.id} value={s.id}>{s.fullName}</option>
                      ))}
                    </optgroup>
                  ))}
              </select>
              <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            </div>

            {(selectedBranch || selectedActor) && (
              <div className="flex items-end">
                <button
                  onClick={() => { setSelectedBranch(''); setSelectedActor(''); }}
                  className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        <ActivityFeed key={feedKey} fixedParams={fixedParams} />
      </div>
    </Layout>
  );
}

export default Activities;
