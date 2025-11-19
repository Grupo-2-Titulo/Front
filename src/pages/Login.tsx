import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/admin/agente')
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
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
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
                placeholder="Ingresa tu contraseña"
                className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700"
            >
              Ingresar
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Para volver a la aplicación, haz clic
            {' '}
            <Link to="/" className="font-semibold text-purple-600 hover:text-purple-700">
              aquí
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
