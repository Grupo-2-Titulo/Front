import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Registro() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    // Validaciones locales
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'usuario' // Rol automático
        })
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Error en el registro')
      }

      setSuccess(true)

      // Intentar login automático para redirigir al panel
      try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        if (loginRes.ok) {
          const data = await loginRes.json()
          localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }))
          localStorage.setItem('token', data.id)
          // limpiar formulario
          setName('')
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          navigate('/admin')
          return
        }
      } catch (loginErr) {
        console.error('Auto-login failed after register:', loginErr)
      }

      // Fallback: redirigir a login
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
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
              Crea tu cuenta para continuar
            </p>
          </div>

          {success && (
            <div className="mb-4 rounded-2xl border border-green-100 bg-green-50/70 p-3 text-sm text-green-600">
              ¡Registro exitoso! Redirigiendo a login...
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50/70 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Pérez"
                className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>
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
                placeholder="Mínimo 8 caracteres"
                className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?
            {' '}
            <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-700">
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
