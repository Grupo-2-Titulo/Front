import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminProfile() {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User
        setProfile(user)
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
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-purple-400">Perfil</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">Editar información</h1>
      </header>

      <form className="space-y-6 rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/80">
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            id="profile-name"
            type="text"
            defaultValue={profile.name}
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
            defaultValue={profile.email}
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
            placeholder="••••••••"
            className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-2xl border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-2xl bg-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  )
}
