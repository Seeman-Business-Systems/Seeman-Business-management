import { Link, Routes, Route, useLocation } from 'react-router-dom';
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
import StaffCreated from './pages/Staff/StaffCreated';
import EditStaff from './pages/Staff/EditStaff';
import StaffProfile from './pages/Staff/StaffProfile';
import StaffActivities from './pages/Staff/StaffActivities';
import MyProfile from './pages/Staff/MyProfile';
import Roles from './pages/Staff/Roles/Roles';
import { Branches, BranchProfile, BranchActivities, CreateBranch, EditBranch } from './pages/Branches';
import { Products, ProductProfile, CreateProduct, EditProduct } from './pages/Products';
import { Inventory } from './pages/Inventory';
import Containers from './pages/Inventory/Containers';
import CreateContainer from './pages/Inventory/CreateContainer';
import ContainerDetail from './pages/Inventory/ContainerDetail';
import { VariantProfile, VariantActivities } from './pages/Variants';
import { Warehouses, WarehouseProfile, WarehouseActivities, CreateWarehouse, EditWarehouse } from './pages/Warehouses';
import { Sales, CreateSale, SaleDetail, SaleReceipt } from './pages/Sales';
import { Supplies, SupplyDetail } from './pages/Supplies';
import { Customers, CustomerProfile } from './pages/Customers';
import { Reservations, ReservationDetail } from './pages/Reservations';
import { Activities } from './pages/Activities';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { Help } from './pages/Help';
import { ReportIssue } from './pages/ReportIssue';
import { SystemSettings } from './pages/SystemSettings';
import ImpersonationBanner from './components/ImpersonationBanner';

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

function Forbidden() {
  const location = useLocation();
  const attemptedPath =
    (location.state as { from?: string } | null)?.from ?? null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
          <i className="fa-solid fa-lock text-2xl text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Access denied</h1>
        <p className="text-gray-600 mt-2">
          You&apos;re not allowed to access this page.
        </p>
        {attemptedPath && (
          <p className="text-sm text-gray-400 mt-2 break-all">
            Attempted: {attemptedPath}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to dashboard
          </Link>
          <Link
            to="/help"
            className="text-indigo-600 hover:underline font-medium"
          >
            Get help
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ToastContainer />
        <ImpersonationBanner />
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forbidden" element={<Forbidden />} />
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
            <ProtectedRoute permission="staff:read">
              <Staff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/new"
          element={
            <ProtectedRoute permission="staff:create">
              <CreateStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/created"
          element={
            <ProtectedRoute permission="staff:create">
              <StaffCreated />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/:id/edit"
          element={
            <ProtectedRoute permission="staff:create">
              <EditStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/roles/manage"
          element={
            <ProtectedRoute permission="role:manage">
              <Roles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/:id"
          element={
            <ProtectedRoute permission="staff:read">
              <StaffProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/:id/activities"
          element={
            <ProtectedRoute permission="staff:read">
              <StaffActivities />
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
            <ProtectedRoute permission="branch:read">
              <Branches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches/new"
          element={
            <ProtectedRoute permission="branch:create">
              <CreateBranch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches/:id"
          element={
            <ProtectedRoute permission="branch:read">
              <BranchProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches/:id/edit"
          element={
            <ProtectedRoute permission="branch:update">
              <EditBranch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches/:id/activities"
          element={
            <ProtectedRoute permission="branch:read">
              <BranchActivities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute permission="product:read">
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute permission="product:create">
              <CreateProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute permission="product:read">
              <ProductProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute permission="product:update">
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute permission="inventory:read">
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/containers"
          element={
            <ProtectedRoute permission="inventory:read">
              <Containers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/containers/new"
          element={
            <ProtectedRoute permission="inventory:adjust">
              <CreateContainer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/containers/:id"
          element={
            <ProtectedRoute permission="inventory:read">
              <ContainerDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/variants/:id"
          element={
            <ProtectedRoute permission="product:read">
              <VariantProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/variants/:id/activities"
          element={
            <ProtectedRoute permission="product:read">
              <VariantActivities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses"
          element={
            <ProtectedRoute permission="warehouse:read">
              <Warehouses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/new"
          element={
            <ProtectedRoute permission="warehouse:create">
              <CreateWarehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/:id"
          element={
            <ProtectedRoute permission="warehouse:read">
              <WarehouseProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/:id/edit"
          element={
            <ProtectedRoute permission="warehouse:update">
              <EditWarehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/:id/activities"
          element={
            <ProtectedRoute permission="warehouse:read">
              <WarehouseActivities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute permission="sale:read">
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/new"
          element={
            <ProtectedRoute permission="sale:create">
              <CreateSale />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/:id/receipt"
          element={
            <ProtectedRoute permission="sale:read">
              <SaleReceipt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/:id"
          element={
            <ProtectedRoute permission="sale:read">
              <SaleDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute permission="customer:read">
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute permission="customer:read">
              <CustomerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplies"
          element={
            <ProtectedRoute permission="supply:read">
              <Supplies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplies/:id"
          element={
            <ProtectedRoute permission="supply:read">
              <SupplyDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute permission="expense:read">
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <ProtectedRoute permission="activity:read">
              <Activities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <Reservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations/:id"
          element={
            <ProtectedRoute>
              <ReservationDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute permission="analytics:read">
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-issue"
          element={
            <ProtectedRoute>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-settings"
          element={
            <ProtectedRoute permission="settings:manage">
              <SystemSettings />
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
