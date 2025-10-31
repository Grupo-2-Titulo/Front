import { Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Dudas from './pages/Dudas'
import FormularioSolicitud from "./pages/FormularioSolicitud"
import Home from './pages/Home'
import Solicitudes from './pages/Solicitudes'
import Subcategorias from "./pages/SubSolicitudes"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dudas" element={<Dudas />} />
      <Route path="/solicitudes" element={<Solicitudes />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/formulario/:categoryId" element={<Subcategorias />} />
      <Route path="/formulario/:categoryId/subcategoria/:subId" element={<FormularioSolicitud />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
