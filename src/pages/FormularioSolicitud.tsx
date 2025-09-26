import BackHeader from '../components/BackHeader'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'

const nombres: Record<string, string> = {
  climatizacion: 'Climatización',
  tv: 'Televisión y Controles',
  bano: 'Baño y Lavamanos',
  electricidad: 'Electricidad e Iluminación',
  mobiliario: 'Mobiliario y Equipamiento',
  otros: 'Otros Requerimientos'
}

export default function FormularioSolicitud() {
  const { tipo } = useParams<{ tipo: string }>()
  const titulo = nombres[tipo || ''] || 'Solicitud'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    // validación básica (ya hay required en inputs)
    if (!message.trim() || !email.trim()) return

    setSent(true)
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <BackHeader title={`Lámina de ${titulo}`} />
      <main className="mx-auto max-w-4xl px-4 py-10">
        {!sent ? (
          <>
            <p className="text-center text-gray-700 font-semibold">
              Detalle de la solicitud: {titulo}
            </p>

            <form
              onSubmit={submit}
              className="mt-8 bg-white border border-gray-100 rounded-2xl shadow-sm max-w-2xl mx-auto p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre y Apellido
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-600/40"
                  placeholder="Escribe tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-600/40"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Detalle de la Solicitud *
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-600/40"
                  placeholder="Describe tu solicitud..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-purple-700 text-white py-2.5 font-medium hover:bg-purple-800"
                disabled={!message.trim() || !email.trim()}
              >
                Enviar solicitud
              </button>

              {/* Pie de página */}
              <p className="mt-6 text-xs text-gray-500 text-center">
                Habitación 4 A – 0 2 / Cama 04
              </p>
            </form>
          </>
        ) : (
          <div className="mt-12 bg-white border border-gray-100 rounded-2xl shadow-sm max-w-2xl mx-auto p-10 text-center">
            <h2 className="text-xl font-semibold text-green-700">Solicitud enviada</h2>
            <p className="mt-4 text-gray-600">
              ¡Gracias! Hemos registrado tu solicitud de {titulo}.
            </p>

            <Link
              to="/solicitudes"
              className="mt-8 inline-block rounded-xl bg-purple-700 text-white px-6 py-2.5 font-medium hover:bg-purple-800"
            >
              Volver a solicitudes
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
