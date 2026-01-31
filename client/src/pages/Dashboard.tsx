import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

function Dashboard() {
  usePageTitle('Dashboard');
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo variant='full' />
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
        <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
      </main>
    </div>
  );
}

export default Dashboard;
