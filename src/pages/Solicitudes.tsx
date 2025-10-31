import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import BackHeader from '../components/BackHeader'
import CardLink from '../components/CardLink'
import { Location } from '../icons/Icons'

interface Category {
  id: string
  name: string
  description?: string
}

export default function Solicitudes() {
  const [categorias, setCategorias] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategorias() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${import.meta.env.VITE_API_URL}/categories/all`)
        if (!res.ok) throw new Error('Error al cargar categorías')

        const data = await res.json()
        setCategorias(data)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar las categorías')
      } finally {
        setLoading(false)
      }
    }

    fetchCategorias()
  }, [])

  return (
    <div className="min-h-dvh bg-gradient-to-b from-purple-50 via-white to-white">
      <BackHeader title="Solicitudes" />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-12 pt-8">
        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-purple-100 bg-white/90 shadow-xl backdrop-blur">
          <div className="border-b border-purple-100 bg-white/60 px-8 py-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">Gestiona tus solicitudes</h2>
            <p className="mt-3 text-sm text-gray-600 md:text-base">
              Selecciona el tipo de requerimiento que necesitas para que podamos ayudarte de la mejor manera.
            </p>
          </div>

          <div className="px-6 py-8">
            {loading && (
              <p className="text-center text-sm text-gray-500 md:text-base">
                Cargando categorías...
              </p>
            )}

            {error && (
              <p className="text-center text-sm text-red-500 md:text-base">
                {error}
              </p>
            )}

            {!loading && !error && (
              <>
                {categorias.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 md:text-base">
                    No hay categorías disponibles en este momento.
                  </p>
                ) : (
                  <section className="grid gap-4 md:grid-cols-2">
                    {categorias.map(categoria => (
                      <CardLink
                        key={categoria.id}
                        to={`/formulario/${categoria.id}`}
                        title={categoria.name}
                        description={categoria.description || 'Selecciona para continuar'}
                      />
                    ))}
                  </section>
                )}
              </>
            )}
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-gray-500">
          ¿Necesitas orientación? Puedes preguntarle al{' '}
          <span className="font-medium text-purple-700">asistente virtual</span> en cualquier momento.
        </p>

        <Link
          to="/dudas"
          className="mx-auto mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-purple-200 bg-white/80 px-5 py-3 text-sm font-medium text-purple-700 shadow-sm transition hover:bg-purple-50"
        >
          Ir al asistente virtual
        </Link>
        <div className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-gray-600">
          <Location />  Av. Vicuña Mackenna 4686, Macul, Región Metropolitana
        </div>
      </main>
    </div>
  )
}
