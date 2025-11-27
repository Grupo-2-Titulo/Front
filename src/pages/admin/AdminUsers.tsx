import { useState } from 'react'

type ManagementView = 'none' | 'add' | 'edit' | 'delete'

const USERS = [
  { name: 'Juanita Gómez', username: 'juanita', email: 'juanita@ucchristus.cl', role: 'Administrador', password: '********' },
  { name: 'Carlos Rivas', username: 'crivas', email: 'crivas@ucchristus.cl', role: 'Analista', password: '********' },
  { name: 'María López', username: 'mlopez', email: 'mlopez@ucchristus.cl', role: 'Supervisor', password: '********' },
]

export default function AdminUsers() {
  const [activeView, setActiveView] = useState<ManagementView>('none')
  const [selectedUser, setSelectedUser] = useState<(typeof USERS)[number] | null>(null)

  const openView = (view: ManagementView, user?: (typeof USERS)[number]) => {
    setSelectedUser(user ?? null)
    setActiveView(view)
  }

  const closeView = () => {
    setActiveView('none')
    setSelectedUser(null)
  }

  const renderForm = () => (
    <form className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="user-name" className="block text-sm font-semibold text-gray-700">
            Nombre completo
          </label>
          <input
            id="user-name"
            type="text"
            defaultValue={activeView === 'edit' ? selectedUser?.name : ''}
            placeholder="Nombre y apellido"
            className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label htmlFor="user-username" className="block text-sm font-semibold text-gray-700">
            Usuario
          </label>
          <input
            id="user-username"
            type="text"
            defaultValue={activeView === 'edit' ? selectedUser?.username : ''}
            placeholder="usuario"
            className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="user-email" className="block text-sm font-semibold text-gray-700">
            Email
          </label>
          <input
            id="user-email"
            type="email"
            defaultValue={activeView === 'edit' ? selectedUser?.email : ''}
            placeholder="correo@ucchristus.cl"
            className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label htmlFor="user-role" className="block text-sm font-semibold text-gray-700">
            Rol
          </label>
          <input
            id="user-role"
            type="text"
            defaultValue={activeView === 'edit' ? selectedUser?.role : ''}
            placeholder="Administrador, Analista..."
            className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
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
          defaultValue={activeView === 'edit' ? '' : ''}
          placeholder="Definir contraseña"
          className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
        />
      </div>
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
          className="rounded-2xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700"
        >
          Guardar cambios
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
            onClick={() => openView('add')}
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
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 bg-white text-gray-700">
              {USERS.map(user => (
                <tr key={user.username} className="hover:bg-purple-50/40">
                  <td className="px-4 py-3 font-semibold text-gray-900">{user.name}</td>
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openView('edit', user)}
                        className="rounded-2xl border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => openView('delete', user)}
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
                {activeView === 'edit' && `Editar ${selectedUser?.username}`}
                {activeView === 'delete' && 'Eliminar usuario'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeView === 'delete'
                  ? 'Esta acción es definitiva y no se puede deshacer.'
                  : 'Completa los datos para gestionar el usuario.'}
              </p>
            </header>

            {(activeView === 'add' || activeView === 'edit') && renderForm()}

            {activeView === 'delete' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-600">
                  Estás a punto de eliminar la cuenta{' '}
                  <span className="font-semibold text-red-700">{selectedUser?.username}</span>. Esta acción
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
                    className="rounded-2xl border border-red-200 bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-200/80 transition hover:bg-red-600"
                  >
                    Eliminar definitivamente
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
