import { Link, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetInventoryQuery } from '../../store/api/inventoryApi';
import { ActivityFeed } from '../../components/activities/ActivityFeed';

function VariantActivities() {
  usePageTitle('Variant Activities');
  const { id } = useParams<{ id: string }>();
  const variantId = id ? Number(id) : undefined;

  const { data: inventoryRecords = [] } = useGetInventoryQuery(
    { variantId: variantId! },
    { skip: !variantId },
  );
  const variantData = inventoryRecords[0]?.variant ?? null;

  if (!variantId) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <Link
          to={`/variants/${variantId}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <i className="fa-solid fa-arrow-left" />
          <span>Back to Variant</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-clock-rotate-left text-indigo-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Activity Feed</h1>
              {variantData && (
                <p className="text-sm text-gray-500">
                  {variantData.variantName}
                  <span className="text-gray-400 font-mono ml-2">{variantData.sku}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <ActivityFeed fixedParams={{ variantId }} />
      </div>
    </Layout>
  );
}

export default VariantActivities;
