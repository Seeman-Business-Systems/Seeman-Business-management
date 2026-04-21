import { Link, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetBranchQuery } from '../../store/api/branchesApi';
import { ActivityFeed } from '../../components/activities/ActivityFeed';

function BranchActivities() {
  usePageTitle('Branch Activities');
  const { id } = useParams<{ id: string }>();
  const branchId = id ? Number(id) : undefined;

  const { data: branch } = useGetBranchQuery(branchId!, { skip: !branchId });

  if (!branchId) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <Link to={`/branches/${branchId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <i className="fa-solid fa-arrow-left" />
          <span>Back to Branch</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-clock-rotate-left text-indigo-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Activity Feed</h1>
              {branch && <p className="text-sm text-gray-500">{branch.name}</p>}
            </div>
          </div>
        </div>

        <ActivityFeed fixedParams={{ branchId }} />
      </div>
    </Layout>
  );
}

export default BranchActivities;
