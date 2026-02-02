import { Layout } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

function Dashboard() {
  usePageTitle('Dashboard');
  const { user } = useAuth();

  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
      </div>
    </Layout>
  );
}

export default Dashboard;