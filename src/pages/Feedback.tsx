import BackHeader from '../components/BackHeader'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Feedback() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState<'felicitacion' | 'reclamo' | ''>('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    // aquí confiamos en los required de los inputs
    setSent(true)

    // limpiar campos
    setName('')
    setEmail('')
    setCategory('')
    setMessage('')
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <BackHeader title="Felicitaciones/Reclamos" />
      <main className="mx-auto max-w-4xl px-4 py-10">
        {!sent ? (
          <>
            <p className="text-center text-gray-700">
              Comparte tu experiencia con nosotros. Tu opinión nos ayuda a mejorar nuestros servicios.
            </p>

            <form
              onSubmit={submit}
              className="mt-8 bg-white border border-gray-100 rounded-2xl shadow-sm max-w-2xl mx-auto p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-600/40"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Correo *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-600/40"
                  placeholder="tu@email.com"
                />
              </div>

              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">Categoría *</legend>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="cat"
                      value="felicitacion"
                      checked={category === 'felicitacion'}
                      onChange={() => setCategory('felicitacion')}
                      className="text-purple-700"
                      required
                    />
                    <span>Felicitación</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="cat"
                      value="reclamo"
                      checked={category === 'reclamo'}
                      onChange={() => setCategory('reclamo')}
                      className="text-purple-700"
                      required
                    />
                    <span>Reclamo</span>
                  </label>
                </div>
              </fieldset>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mensaje *</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-600/40"
                  placeholder="Comparte tu experiencia con nosotros..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-purple-700 text-white py-2.5 font-medium hover:bg-purple-800"
              >
                Enviar mensaje
              </button>

              {/* Disclaimer */}
              <p className="mt-6 text-xs text-gray-500 text-center">
                Los datos proporcionados serán utilizados únicamente para comprobar que es paciente de UC Christus.
              </p>
            </form>
          </>
        ) : (
          <div className="mt-12 bg-white border border-gray-100 rounded-2xl shadow-sm max-w-2xl mx-auto p-10 text-center">
            <h2 className="text-xl font-semibold text-green-700">Mensaje enviado</h2>
            <p className="mt-4 text-gray-600">
              ¡Gracias por tu tiempo! Hemos registrado tu mensaje correctamente.
            </p>

            <Link
              to="/"
              className="mt-8 inline-block rounded-xl bg-purple-700 text-white px-6 py-2.5 font-medium hover:bg-purple-800"
            >
              Volver al menú
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
