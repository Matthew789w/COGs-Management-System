import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import CreateProductPage from './pages/CreateProductPage'
import MaterialsPage from './pages/MaterialsPage'
import UnitsPage from './pages/UnitsPage'
import UtilitiesPage from './pages/UtilitiesPage'
import BillOfMaterialsPage from './pages/BillOfMaterialsPage'
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
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/bom" element={<BillOfMaterialsPage />} />
          <Route path="/units" element={<UnitsPage />} />
          <Route path="/utilities" element={<UtilitiesPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
