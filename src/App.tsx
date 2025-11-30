import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Footer from './components/Footer'
import BedContext from './context/BedContext'
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
import Solicitudes from './pages/Solicitudes'
import Subcategorias from './pages/SubSolicitudes'
import type { Bed } from './types/bed'

async function getBedFromToken(token: string): Promise<Bed> {
  if (!token) {
    throw new Error('Token vacío')
  }

  const response = await fetch(
    `https://back-kki7.onrender.com/beds/by_token/${encodeURIComponent(token)}`
  )
  if (!response.ok) {
    throw new Error(`Error al obtener cama por token (${response.status})`)
  }

  const bed = await response.json() as Bed
  return bed
}

async function getBedById(bedId: string): Promise<Bed> {
  if (!bedId) {
    throw new Error('bed_id vacío')
  }

  const response = await fetch(
    `https://back-kki7.onrender.com/beds/by_id/${encodeURIComponent(bedId)}`
  )
  if (!response.ok) {
    throw new Error(`Error al obtener cama por id (${response.status})`)
  }

  const bed = await response.json() as Bed
  return bed
}

export default function App() {
  const [encryptedToken, setEncryptedToken] = useState('')
  const [bedId, setBedId] = useState('')
  const [bedInfo, setBedInfo] = useState<Bed | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = window.location.pathname.replace(/^\//, '')
    setEncryptedToken(token)
    console.log('Encrypted token captured:', token)
  }, [])

  useEffect(() => {
    if (!encryptedToken) return

    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const bedFromToken = await getBedFromToken(encryptedToken)
        console.log('Bed from token:', bedFromToken)

        if (!bedFromToken.id) {
          throw new Error('La cama obtenida no contiene un ID válido')
        }

        setBedId(bedFromToken.id)

        const fullBedInfo = await getBedById(bedFromToken.id)
        console.log('Full bed info:', fullBedInfo)
        setBedInfo(fullBedInfo)
      } catch (err) {
        console.error('Error loading bed info:', err)
        setBedInfo(null)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    })()
  }, [encryptedToken])

  return (
    <BedContext.Provider
      value={{ encryptedToken, bedId, bedInfo, loading, error }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dudas" element={<Dudas />} />
        <Route path="/solicitudes" element={<Solicitudes />} />
        <Route path="/login" element={<Login />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <section className="bed-info-section">
        {loading && <p>Cargando información de la cama...</p>}
        {error && <p className="bed-info-error">Error: {error}</p>}
        {bedInfo && (
          <div className="bed-info">
            <h2>Información de la cama</h2>
            <pre>{JSON.stringify(bedInfo, null, 2)}</pre>
          </div>
        )}
      </section>

      <Footer encrypted={encryptedToken} bedId={bedId} />
    </BedContext.Provider>
  )
}
