import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Dudas from './pages/Dudas'
import Solicitudes from './pages/Solicitudes'
import Feedback from './pages/Feedback'
import FormularioSolicitud from "./pages/FormularioSolicitud"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dudas" element={<Dudas />} />
      <Route path="/solicitudes" element={<Solicitudes />} />
      <Route path="/formulario/:tipo" element={<FormularioSolicitud />} />
      <Route path="/felicitaciones-reclamos" element={<Feedback />} />
      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}