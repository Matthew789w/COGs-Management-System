import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import CreateProductPage from './pages/CreateProductPage'
import ViewProductPage from './pages/ViewProductPage'
import EditProductPage from './pages/EditProductPage'
import DeleteProductPage from './pages/DeleteProductPage'
import MaterialsPage from './pages/MaterialsPage'
import CreateMaterialPage from './pages/CreateMaterialPage'
import ViewMaterialPage from './pages/ViewMaterialPage'
import EditMaterialPage from './pages/EditMaterialPage'
import DeleteMaterialPage from './pages/DeleteMaterialPage'
import UnitsPage from './pages/UnitsPage'
import CreateUnitPage from './pages/CreateUnitPage'
import ViewUnitPage from './pages/ViewUnitPage'
import EditUnitPage from './pages/EditUnitPage'
import DeleteUnitPage from './pages/DeleteUnitPage'
import UtilitiesPage from './pages/UtilitiesPage'
import CreateUtilityPage from './pages/CreateUtilityPage'
import ViewUtilityPage from './pages/ViewUtilityPage'
import EditUtilityPage from './pages/EditUtilityPage'
import DeleteUtilityPage from './pages/DeleteUtilityPage'
import BillOfMaterialsPage from './pages/BillOfMaterialsPage'
import ManufacturingReportPage from './pages/ManufacturingReportPage'
import CogsReportPage from './pages/reports/CogsReportPage'
import ReportsHubPage from './pages/reports/ReportsHubPage'
import ProductionPage from './pages/ProductionPage'
import InventoryPage from './pages/InventoryPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'
import CreateUserPage from './pages/CreateUserPage'
import ViewUserPage from './pages/ViewUserPage'
import EditUserPage from './pages/EditUserPage'
import DeleteUserPage from './pages/DeleteUserPage'
import AdminRoute from './components/auth/AdminRoute'
import { NotificationsProvider } from './context/NotificationsContext'
import { UserProvider } from './context/UserContext'
import './App.css'

function AuthenticatedApp() {
  return (
    <ProtectedRoute>
      <UserProvider>
        <NotificationsProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/production" element={<ProductionPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/create" element={<CreateProductPage />} />
              <Route path="/products/:id/edit" element={<EditProductPage />} />
              <Route path="/products/:id/delete" element={<DeleteProductPage />} />
              <Route path="/products/:id" element={<ViewProductPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/materials/create" element={<CreateMaterialPage />} />
              <Route path="/materials/:id/edit" element={<EditMaterialPage />} />
              <Route path="/materials/:id/delete" element={<DeleteMaterialPage />} />
              <Route path="/materials/:id" element={<ViewMaterialPage />} />
              <Route path="/bom" element={<BillOfMaterialsPage />} />
              <Route path="/bom/reports/manufacturing-summary" element={<ManufacturingReportPage />} />
              <Route path="/bom/reports/cogs/:reportSlug" element={<CogsReportPage />} />
              <Route path="/bom/reports" element={<ReportsHubPage />} />
              <Route path="/units" element={<UnitsPage />} />
              <Route path="/units/create" element={<CreateUnitPage />} />
              <Route path="/units/:id/edit" element={<EditUnitPage />} />
              <Route path="/units/:id/delete" element={<DeleteUnitPage />} />
              <Route path="/units/:id" element={<ViewUnitPage />} />
              <Route path="/utilities" element={<UtilitiesPage />} />
              <Route path="/utilities/create" element={<CreateUtilityPage />} />
              <Route path="/utilities/:id/edit" element={<EditUtilityPage />} />
              <Route path="/utilities/:id/delete" element={<DeleteUtilityPage />} />
              <Route path="/utilities/:id" element={<ViewUtilityPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route
                path="/users"
                element={
                  <AdminRoute>
                    <UsersPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/users/create"
                element={
                  <AdminRoute>
                    <CreateUserPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/users/:id/edit"
                element={
                  <AdminRoute>
                    <EditUserPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/users/:id/delete"
                element={
                  <AdminRoute>
                    <DeleteUserPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/users/:id"
                element={
                  <AdminRoute>
                    <ViewUserPage />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppShell>
        </NotificationsProvider>
      </UserProvider>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<AuthenticatedApp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
