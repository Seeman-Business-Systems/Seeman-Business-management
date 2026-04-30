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
import StaffActivities from './pages/Staff/StaffActivities';
import MyProfile from './pages/Staff/MyProfile';
import Roles from './pages/Staff/Roles/Roles';
import { Branches, BranchProfile, BranchActivities, CreateBranch, EditBranch } from './pages/Branches';
import { Products, ProductProfile, CreateProduct, EditProduct } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { VariantProfile } from './pages/Variants';
import { Warehouses, WarehouseProfile, WarehouseActivities, CreateWarehouse, EditWarehouse } from './pages/Warehouses';
import { Sales, CreateSale, SaleDetail, SaleReceipt } from './pages/Sales';
import { Supplies, SupplyDetail } from './pages/Supplies';
import { Customers, CustomerProfile } from './pages/Customers';
import { Reservations, ReservationDetail } from './pages/Reservations';
import { Activities } from './pages/Activities';
import { Expenses } from './pages/Expenses';
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
          path="/staff/:id/activities"
          element={
            <ProtectedRoute>
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
        <Route
          path="/branches/:id/activities"
          element={
            <ProtectedRoute>
              <BranchActivities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute>
              <CreateProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/variants/:id"
          element={
            <ProtectedRoute>
              <VariantProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses"
          element={
            <ProtectedRoute>
              <Warehouses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/new"
          element={
            <ProtectedRoute>
              <CreateWarehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/:id"
          element={
            <ProtectedRoute>
              <WarehouseProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/:id/edit"
          element={
            <ProtectedRoute>
              <EditWarehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/:id/activities"
          element={
            <ProtectedRoute>
              <WarehouseActivities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/new"
          element={
            <ProtectedRoute>
              <CreateSale />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/:id/receipt"
          element={
            <ProtectedRoute>
              <SaleReceipt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/:id"
          element={
            <ProtectedRoute>
              <SaleDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplies"
          element={
            <ProtectedRoute>
              <Supplies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplies/:id"
          element={
            <ProtectedRoute>
              <SupplyDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <ProtectedRoute>
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
          path="/system-settings"
          element={
            <ProtectedRoute>
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
