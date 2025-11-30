import { Navigate, Route, Routes } from 'react-router-dom'

import Admin from './pages/Admin'
import AdminAgent from './pages/admin/AdminAgent'
import AdminProfile from './pages/admin/AdminProfile'
import AdminRequests from './pages/admin/AdminRequests'
import AdminRooms from './pages/admin/AdminRooms'
import AdminUsers from './pages/admin/AdminUsers'
import Dudas from './pages/Dudas'
import FormularioSolicitud from './pages/FormularioSolicitud'
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Solicitudes from './pages/Solicitudes'
import Subcategorias from './pages/SubSolicitudes'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dudas" element={<Dudas />} />
        <Route path="/solicitudes" element={<Solicitudes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/admin" element={<Admin />}>
          <Route index element={<Navigate to="/admin/agente" replace />} />
          <Route path="agente" element={<AdminAgent />} />
          <Route path="solicitudes" element={<AdminRequests />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="habitaciones" element={<AdminRooms />} />
          <Route path="perfil" element={<AdminProfile />} />
        </Route>
        <Route path="/formulario/:categoryId" element={<Subcategorias />} />
        <Route
          path="/formulario/:categoryId/subcategoria/:subId"
          element={<FormularioSolicitud />}
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  )
}
