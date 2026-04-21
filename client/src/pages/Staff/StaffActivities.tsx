import { Link, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetStaffQuery } from '../../store/api/staffApi';
import { ActivityFeed } from '../../components/activities/ActivityFeed';

function StaffActivities() {
  usePageTitle('Staff Activities');
  const { id } = useParams<{ id: string }>();
  const staffId = id ? Number(id) : undefined;

  const { data: staff } = useGetStaffQuery(staffId!, { skip: !staffId });

  if (!staffId) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <Link to={`/staff/${staffId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <i className="fa-solid fa-arrow-left" />
          <span>Back to Profile</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-clock-rotate-left text-indigo-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Activity Feed</h1>
              {staff && <p className="text-sm text-gray-500">{staff.fullName}</p>}
            </div>
          </div>
        </div>

        <ActivityFeed fixedParams={{ actorId: staffId }} />
      </div>
    </Layout>
  );
}

export default StaffActivities;
