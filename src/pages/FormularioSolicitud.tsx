import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Location } from '../icons/Icons'

import BackHeader from '../components/BackHeader'

interface Subcategory {
  id: string
  name: string
  description?: string
  category_id: string
}

export default function FormularioSolicitud() {
  const { subId } = useParams<{ subId: string }>()
  const [subcategoria, setSubcategoria] = useState<Subcategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const bedId = '5433a5ec-32cf-405d-b27d-989961bff3ed'

  useEffect(() => {
    async function fetchSubcategoria() {
      try {
        setLoading(true)
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/subcategories/by_id/${subId}`
        )
        if (!res.ok) throw new Error('Error al cargar la subcategoría')
        const data = await res.json()
        setSubcategoria(data)
      } catch (err) {
        console.error(err)
        setError('No se pudo cargar la subcategoría')
      } finally {
        setLoading(false)
      }
    }

    if (subId) fetchSubcategoria()
  }, [subId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || !email.trim() || !subcategoria) return

    setSending(true)
    setError(null)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/protected/tickets/${bedId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            category_id: subcategoria.category_id,
            subcategory_id: subcategoria.id,
            description: message
          })
        }
      )

      if (!res.ok) throw new Error(`Error al crear ticket (${res.status})`)

      const raw = await res.text()
      let data
      try {
        data = JSON.parse(raw)
      } catch {
        data = raw
      }

      console.log('✅ Ticket creado:', data)
      setSent(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      console.error(err)
      setError('No se pudo enviar la solicitud. Intenta más tarde.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-purple-50 via-white to-white">
        <BackHeader title="Cargando..." />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-12 pt-8">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-center rounded-3xl border border-purple-100 bg-white/90 px-8 py-16 text-center text-sm text-gray-500 shadow-xl backdrop-blur md:text-base">
            Cargando datos de la subcategoría...
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-purple-50 via-white to-white">
      <BackHeader title={subcategoria?.name || 'Solicitud'} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-12 pt-8">
        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-purple-100 bg-white/90 shadow-xl backdrop-blur">
          {!sent ? (
            <>
              <div className="border-b border-purple-100 bg-white/60 px-8 py-8 text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Completa tu solicitud
                </h2>
                <p className="mt-3 text-sm text-gray-600 md:text-base">
                  {subcategoria?.description ||
                    'Proporciona el detalle para gestionar tu requerimiento.'}
                </p>
              </div>

              <form onSubmit={submit} className="space-y-6 px-8 py-10">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                    Nombre y Apellido
                    <input
                      id="name"
                      value={name}
                      onChange={event => setName(event.target.value)}
                      placeholder="Escribe tu nombre"
                      className="rounded-xl border border-purple-200 bg-white/80 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                    Correo Electrónico
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      required
                      placeholder="correo@ejemplo.com"
                      className="rounded-xl border border-purple-200 bg-white/80 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                  Detalle de la Solicitud
                  <textarea
                    id="message"
                    value={message}
                    onChange={event => setMessage(event.target.value)}
                    rows={6}
                    required
                    placeholder="Describe tu solicitud..."
                    className="rounded-2xl border border-purple-200 bg-white/80 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </label>

                {error && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-purple-700 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-300"
                  disabled={!message.trim() || !email.trim() || sending}
                >
                  {sending ? 'Enviando...' : 'Enviar solicitud'}
                </button>

                <p className="text-center text-xs text-gray-500">
                  Habitación 4 A – 0 2 / Cama 04
                </p>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center px-8 py-16 text-center">
              <h2 className="text-2xl font-semibold text-purple-700">
                ¡Solicitud enviada con éxito!
              </h2>
              <p className="mt-4 max-w-md text-sm text-gray-600 md:text-base">
                Gracias, hemos registrado tu solicitud de {subcategoria?.name}. Nuestro equipo se
                pondrá en contacto contigo pronto.
              </p>

              <Link
                to="/"
                className="mt-8 inline-flex items-center justify-center rounded-2xl bg-purple-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-800"
              >
                Volver al inicio
              </Link>
            </div>
          )}
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-gray-500">
          Si necesitas realizar otra solicitud, puedes regresar al listado o contactar al asistente
          virtual.
        </p>
        <div className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-gray-600">
          <Location />  Av. Vicuña Mackenna 4686, Macul, Región Metropolitana
        </div>
      </main>
    </div>
  )
}
