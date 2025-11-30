import { useEffect, useState } from 'react'

import type { User } from '../../types/user'

type ManagementView = 'none' | 'add' | 'edit' | 'delete'

export default function AdminUsers() {
  const [activeView, setActiveView] = useState<ManagementView>('none')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'usuario' })
  const [modalError, setModalError] = useState<string | null>(null)

  const parseErrorMessage = (errorText: string): string => {
    try {
      const json = JSON.parse(errorText)
      return json.message || errorText
    } catch {
      return errorText
    }
  }

  const API_URL = import.meta.env.VITE_API_URL

  const openAdd = () => {
    setSelectedUser(null)
    setForm({ name: '', email: '', password: '', role: 'usuario' })
    setActiveView('add')
  }

  const openEdit = (user: User) => {
    setSelectedUser(user)
    setForm({ name: user.name, email: user.email, password: '', role: user.role })
    setActiveView('edit')
  }

  const openDelete = (user: User) => {
    setSelectedUser(user)
    setActiveView('delete')
  }

  const closeView = () => {
    setActiveView('none')
    setSelectedUser(null)
    setModalError(null)
  }

  async function fetchUsers() {
    try {
      setLoading(true)
      setError(null)

      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id
      const token = localStorage.getItem('token')
      if (!userId || !token) {
        setError('Necesitas iniciar sesión como admin para ver usuarios')
        return
      }

      const res = await fetch(`${API_URL}/protected/admin/`, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)

      const data = await res.json()
      const sorted = Array.isArray(data) ? data.sort((a, b) => {
        const nameA = String(a.name ?? '').toLowerCase()
        const nameB = String(b.name ?? '').toLowerCase()
        return nameA.localeCompare(nameB)
      }) : []
      setUsers(sorted)
    } catch (err) {
      console.error('Error fetching users:', err)
      const message = err instanceof Error ? err.message : 'No se pudieron cargar los usuarios'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function createUser() {
    try {
      setLoading(true)
      setError(null)
      setModalError(null)

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role })
      })

      if (!res.ok) {
        const text = await res.text()
        const message = parseErrorMessage(text)
        setModalError(message)
        return
      }

      await fetchUsers()
      closeView()
    } catch (err) {
      console.error(err)
      setModalError(err instanceof Error ? err.message : 'Error creando el usuario')
    } finally {
      setLoading(false)
    }
  }

  async function updateUser() {
    if (!selectedUser) return
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id
    const token = localStorage.getItem('token')
    if (!userId || !token) {
      setModalError('Necesitas iniciar sesión para editar usuarios')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setModalError(null)

      // Construir body solo con campos no vacíos y diferentes
      const body: Record<string, string> = {}
      if (form.name && form.name !== selectedUser.name) body.name = form.name
      if (form.email && form.email !== selectedUser.email) body.email = form.email
      if (form.password) body.password = form.password
      // Solo admin puede cambiar rol
      if (user.role === 'admin' && form.role && form.role !== selectedUser.role) body.role = form.role

      let endpoint = ''
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'Authorization': `Bearer ${token}`
      }
      if (user.role === 'admin' && userId !== selectedUser.id) {
        endpoint = `${API_URL}/protected/admin/${encodeURIComponent(selectedUser.id)}`
      } else {
        endpoint = `${API_URL}/protected/users/by_id/${encodeURIComponent(selectedUser.id)}`
        // No enviar rol si no es admin
        delete body.role
      }

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const text = await res.text()
        const message = parseErrorMessage(text)
        setModalError(message)
        return
      }

      await fetchUsers()
      closeView()
    } catch (err) {
      console.error(err)
      setModalError(err instanceof Error ? err.message : 'Error actualizando el usuario')
    } finally {
      setLoading(false)
    }
  }

  async function deleteUser() {
    if (!selectedUser) return
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id
    const token = localStorage.getItem('token')
    if (!userId || !token) {
      setModalError('Necesitas iniciar sesión como admin para eliminar usuarios')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setModalError(null)

      const res = await fetch(`${API_URL}/protected/admin/${encodeURIComponent(selectedUser.id)}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId,
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        const text = await res.text()
        const message = parseErrorMessage(text)
        setModalError(message)
        return
      }

      await fetchUsers()
      closeView()
    } catch (err) {
      console.error(err)
      setModalError(err instanceof Error ? err.message : 'Error eliminando el usuario')
    } finally {
      setLoading(false)
    }
  }

  const renderForm = () => (
    <form className="space-y-5">
      {activeView === 'add' && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="user-name" className="block text-sm font-semibold text-gray-700">
                Nombre completo
              </label>
              <input
                id="user-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre y apellido"
                autoComplete="off"
                className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div>
              <label htmlFor="user-email" className="block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="correo@ucchristus.cl"
                autoComplete="off"
                className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>
          <div>
            <label htmlFor="user-password" className="block text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <input
              id="user-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>
          <div>
            <label htmlFor="user-role-create" className="block text-sm font-semibold text-gray-700">
              Rol
            </label>
            <select
              id="user-role-create"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            >
              <option value="usuario">Usuario Estándar</option>
              <option value="medico">Médico</option>
              <option value="enfermero">Enfermero</option>
              <option value="aseo">Personal de aseo</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </>
      )}

      {activeView === 'edit' && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-semibold text-gray-700">Nombre</label>
              <input
                id="edit-name"
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={(selectedUser?.name || '') + ' (sin modificar)'}
                autoComplete="off"
                className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div>
              <label htmlFor="edit-email" className="block text-sm font-semibold text-gray-700">Email</label>
              <input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder={(selectedUser?.email || '') + ' (sin modificar)'}
                autoComplete="off"
                className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-password" className="block text-sm font-semibold text-gray-700">Contraseña</label>
            <input
              id="edit-password"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Nueva contraseña (opcional)"
              autoComplete="new-password"
              className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>
          {/* Solo admin puede cambiar rol */}
          {(() => {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            if (user.role === 'admin') {
              return (
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-semibold text-gray-700">Rol</label>
                  <select
                    id="edit-role"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="usuario">Usuario Estándar</option>
                    <option value="medico">Médico</option>
                    <option value="enfermero">Enfermero</option>
                    <option value="aseo">Personal de aseo</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              )
            }
            return null
          })()}
        </>
      )}

      <div className="flex flex-wrap justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={closeView}
          className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => {
            if (activeView === 'add') void createUser()
            if (activeView === 'edit') void updateUser()
          }}
          disabled={loading}
          className="rounded-2xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )

  return (
    <div className="space-y-8">
      <header className="border-b border-purple-50 pb-4">
        <p className="text-sm uppercase tracking-[0.4em] text-purple-400">Usuarios</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">Gestión de cuentas</h1>
      </header>

      <div className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/80">
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Panel</p>
            <h2 className="text-xl font-semibold text-gray-900">Listado de usuarios</h2>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="rounded-2xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700"
          >
            Añadir usuario
          </button>
        </div>

        <div className="overflow-auto rounded-2xl border border-purple-50">
          <table className="min-w-full divide-y divide-purple-50 text-sm">
            <thead className="bg-purple-50/70 text-xs font-semibold uppercase tracking-wide text-purple-600">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 bg-white text-gray-700">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                    Cargando usuarios...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                    No hay usuarios disponibles.
                  </td>
                </tr>
              )}

              {!loading && !error && users.map((user: User) => (
                <tr key={user.id} className="hover:bg-purple-50/40">
                  <td className="px-4 py-3 font-semibold text-gray-900">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="rounded-2xl border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(user)}
                        className="rounded-2xl border border-red-100 px-3 py-1 text-xs font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50"
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeView !== 'none' && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-purple-100 bg-white p-8 shadow-2xl">
            <header className="mb-6 border-b border-purple-50 pb-4">
              <p className="text-xs uppercase tracking-[0.4em] text-purple-400">Gestión</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                {activeView === 'add' && 'Añadir nuevo usuario'}
                {activeView === 'edit' && `Editar ${selectedUser?.name}`}
                {activeView === 'delete' && 'Eliminar usuario'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeView === 'delete'
                  ? 'Esta acción es definitiva y no se puede deshacer.'
                  : 'Completa los datos para gestionar el usuario.'}
              </p>
            </header>

            {modalError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <p>{modalError}</p>
              </div>
            )}

            {(activeView === 'add' || activeView === 'edit') && renderForm()}

            {activeView === 'delete' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-600">
                  Estás a punto de eliminar la cuenta{' '}
                  <span className="font-semibold text-red-700">{selectedUser?.name}</span>. Esta acción
                  no se puede revertir.
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeView}
                    className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteUser()}
                    disabled={loading}
                    className="rounded-2xl border border-red-200 bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-200/80 transition hover:bg-red-600 disabled:opacity-50"
                  >
                    {loading ? 'Eliminando...' : 'Eliminar definitivamente'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
