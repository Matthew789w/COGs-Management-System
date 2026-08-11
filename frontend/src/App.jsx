import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
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
import ProductionPage from './pages/ProductionPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
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
          <Route path="/bom/reports" element={<ManufacturingReportPage />} />
          <Route path="/production" element={<ProductionPage />} />
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
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
