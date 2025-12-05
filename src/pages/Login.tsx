import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface LoginResponse {
  id: string
  role: string
  name: string
  email: string
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = import.meta.env.VITE_API_URL

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) {
        // Intentar parsear JSON de error y mapear mensajes conocidos a uno más profesional
        let errMsg = 'Error en el inicio de sesión'
        try {
          const errJson = await res.json()
          if (errJson && typeof errJson === 'object' && 'message' in errJson) {
            const serverMessage = String((errJson as any).message)
            if (serverMessage.includes('Credenciales')) {
              errMsg = 'Correo electrónico o contraseña incorrectos. Verifica tus credenciales e inténtalo nuevamente.'
            } else {
              errMsg = serverMessage || errMsg
            }
          } else {
            const text = await res.text()
            errMsg = text || errMsg
          }
        } catch {
          const text = await res.text().catch(() => '')
          errMsg = text || errMsg
        }

        throw new Error(errMsg)
      }

      const data: LoginResponse = await res.json()

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      }))
      localStorage.setItem('token', data.id) // Usar el ID como token temporal

      // Redirigir al panel /admin (el índice redirige a la vista por defecto)
      navigate('/admin')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-purple-50 via-white to-white">
      <main className="mx-auto flex min-h-dvh max-w-4xl flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-purple-100 bg-white/90 p-8 shadow-lg shadow-purple-100/40">
          <div className="mb-8 text-center">
            <img
              src="https://d328k6xhl3lmif.cloudfront.net/images/default-source/p-100-images/logos/uclogo.png?sfvrsn=892c35e5_1"
              alt="Logo UC Christus"
              className="mx-auto h-8 w-auto object-contain"
            />
            <p className="mt-2 text-sm text-gray-600">
              Introduce tus credenciales para continuar
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50/70 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@ucchristus.cl"
                className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
