import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminProfile() {
  const [profile, setProfile] = useState<User | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User
        setProfile(user)
        setForm({ name: '', email: '', password: '' })
      } catch (err) {
        console.error('Error parsing user from localStorage:', err)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!profile) {
    return <div>Error: No se pudo cargar el perfil</div>
  }

  const API_URL = import.meta.env.VITE_API_URL

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    const userId = profile.id
    const token = localStorage.getItem('token')
    if (!userId || !token) {
      setError('Necesitas iniciar sesión para editar tu perfil')
      setSaving(false)
      return
    }
    // Solo enviar campos modificados/no vacíos
    const body: Record<string, string> = {}
    if (form.name) body.name = form.name
    if (form.email) body.email = form.email
    if (form.password) body.password = form.password

    try {
      const res = await fetch(`${API_URL}/protected/users/by_id/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const text = await res.text()
        let message = text
        try {
          const json = JSON.parse(text)
          message = json.message || text
        } catch {}
        setError(message)
        setSaving(false)
        return
      }
      // Actualizar localStorage y estado
      const updated = { ...profile, ...body }
      localStorage.setItem('user', JSON.stringify(updated))
      setProfile(updated)
      setForm({ name: '', email: '', password: '' })
      setSuccess('Perfil actualizado exitosamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando el perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-purple-400">Perfil</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">Editar información</h1>
      </header>

      <form className="space-y-6 rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/80" onSubmit={e => e.preventDefault()}>
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <p>{success}</p>
          </div>
        )}
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            id="profile-name"
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder={profile.name + ' (sin modificar)'}
            className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700">
            Correo
          </label>
          <input
            id="profile-email"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder={profile.email + ' (sin modificar)'}
            autoComplete="off"
            className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div>
          <label htmlFor="profile-password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="profile-password"
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Nueva contraseña (opcional)"
            autoComplete="new-password"
            className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-2xl border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            onClick={() => {
              setForm({ name: '', email: '', password: '' })
              setError(null)
              setSuccess(null)
            }}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-2xl bg-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
