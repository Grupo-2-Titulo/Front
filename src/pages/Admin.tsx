import { Link, NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { label: 'Agente virtual', to: '/admin/agente' },
  { label: 'Solicitudes', to: '/admin/solicitudes' },
  { label: 'Habitaciones', to: '/admin/habitaciones' },
  { label: 'Usuarios', to: '/admin/usuarios' },
]

const ACTIVE_ADMIN = {
  name: 'Juanita Gómez',
  role: 'Administrador',
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(part => part.trim()[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()

export default function Admin() {
  const profileInitials = getInitials(ACTIVE_ADMIN.name)
  return (
    <div className="min-h-dvh bg-gradient-to-br from-purple-50 via-white to-white">
      <div className="mx-auto flex min-h-dvh max-w-6xl gap-6 px-4 py-10">
        <aside className="flex w-64 flex-col rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-lg shadow-purple-100/40">
          <NavLink
            to="/admin/perfil"
            className={({ isActive }) =>
              [
                'block rounded-2xl border border-purple-100 bg-purple-50/50 p-5 text-center transition',
                isActive ? 'border-purple-400 shadow-lg shadow-purple-200' : 'hover:border-purple-300',
              ].join(' ')
            }
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-purple-600 text-3xl font-semibold text-white">
              {profileInitials}
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">{ACTIVE_ADMIN.name}</p>
            <p className="text-sm text-purple-500">{ACTIVE_ADMIN.role}</p>
          </NavLink>

          <div className="mt-6 border-t border-purple-100 pt-6">
            <nav className="space-y-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'block rounded-2xl border px-4 py-3 text-center text-sm font-semibold transition',
                      isActive
                        ? 'border-purple-400 bg-purple-600 text-white shadow-lg shadow-purple-300/60'
                        : 'border-purple-100 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <Link
              to="/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50"
            >
              Cerrar sesión
            </Link>
          </div>
        </aside>

        <section className="flex-1 rounded-3xl border border-purple-100 bg-white/70 p-8">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
