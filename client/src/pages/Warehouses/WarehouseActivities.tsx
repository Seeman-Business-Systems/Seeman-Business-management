import { Link, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetWarehouseQuery } from '../../store/api/warehousesApi';
import { ActivityFeed } from '../../components/activities/ActivityFeed';

function WarehouseActivities() {
  usePageTitle('Warehouse Activities');
  const { id } = useParams<{ id: string }>();
  const warehouseId = id ? Number(id) : undefined;

  const { data: warehouse } = useGetWarehouseQuery(warehouseId!, { skip: !warehouseId });

  if (!warehouseId) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <Link to={`/warehouses/${warehouseId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <i className="fa-solid fa-arrow-left" />
          <span>Back to Warehouse</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-clock-rotate-left text-indigo-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Activity Feed</h1>
              {warehouse && <p className="text-sm text-gray-500">{warehouse.name}</p>}
            </div>
          </div>
        </div>

        <ActivityFeed fixedParams={{ warehouseId }} />
      </div>
    </Layout>
  );
}

export default WarehouseActivities;
