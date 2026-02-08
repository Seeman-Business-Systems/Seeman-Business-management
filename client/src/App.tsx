import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ui/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login/Login';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Dashboard from './pages/Dashboard';
import Staff from './pages/Staff/Staff';
import CreateStaff from './pages/Staff/CreateStaff';
import EditStaff from './pages/Staff/EditStaff';
import StaffProfile from './pages/Staff/StaffProfile';
import MyProfile from './pages/Staff/MyProfile';
import Roles from './pages/Staff/Roles/Roles';
import { Branches, BranchProfile, CreateBranch, EditBranch } from './pages/Branches';

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-gray-600 mt-2">Page not found</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ToastContainer />
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <Staff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/new"
          element={
            <ProtectedRoute>
              <CreateStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/:id/edit"
          element={
            <ProtectedRoute>
              <EditStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/roles/manage"
          element={
            <ProtectedRoute>
              <Roles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/:id"
          element={
            <ProtectedRoute>
              <StaffProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/me"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches"
          element={
            <ProtectedRoute>
              <Branches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches/new"
          element={
            <ProtectedRoute>
              <CreateBranch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches/:id"
          element={
            <ProtectedRoute>
              <BranchProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches/:id/edit"
          element={
            <ProtectedRoute>
              <EditBranch />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
