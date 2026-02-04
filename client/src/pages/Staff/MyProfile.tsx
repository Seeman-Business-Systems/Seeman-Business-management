import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import StaffProfile from './StaffProfile';

function MyProfile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render StaffProfile with the current user's ID
  return <StaffProfile staffId={user.id} isMyprofile />;
}

export default MyProfile;