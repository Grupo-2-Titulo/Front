import BackHeader from '../components/BackHeader'
import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/subcategories/by_id/${subId}`)
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/protected/tickets/${bedId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: subcategoria.category_id,
          subcategory_id: subcategoria.id,
          description: message,
        }),
      })

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
      <div className="min-h-dvh bg-gray-50">
        <BackHeader title="Cargando..." />
        <main className="mx-auto max-w-4xl px-4 py-10 text-center text-gray-500">
          Cargando datos de la subcategoría...
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <BackHeader title={`Lámina de ${subcategoria?.name || 'Solicitud'}`} />
      <main className="mx-auto max-w-4xl px-4 py-10">
        {!sent ? (
          <>
            <p className="text-center text-gray-700 font-semibold">
              Detalle de la solicitud: {subcategoria?.name}
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
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-600/40"
                  placeholder="Escribe tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-600/40"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Detalle de la Solicitud
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-600/40"
                  placeholder="Describe tu solicitud..."
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full rounded-xl bg-purple-700 text-white py-2.5 font-medium hover:bg-purple-800 disabled:opacity-60"
                disabled={!message.trim() || !email.trim() || sending}
              >
                {sending ? 'Enviando...' : 'Enviar solicitud'}
              </button>

              <p className="mt-6 text-xs text-gray-500 text-center">
                Habitación 4 A – 0 2 / Cama 04
              </p>
            </form>
          </>
        ) : (
          <div className="mt-12 bg-white border border-gray-100 rounded-2xl shadow-sm max-w-2xl mx-auto p-10 text-center">
            <h2 className="text-xl font-semibold text-green-700">Solicitud enviada</h2>
            <p className="mt-4 text-gray-600">
              ¡Gracias! Hemos registrado tu solicitud de {subcategoria?.name}.
            </p>

            <Link
              to="/"
              className="mt-8 inline-block rounded-xl bg-purple-700 text-white px-6 py-2.5 font-medium hover:bg-purple-800"
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
