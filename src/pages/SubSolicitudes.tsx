import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import BackHeader from '../components/BackHeader'
import CardLink from '../components/CardLink'
import { Location } from '../icons/Icons'

interface Subcategory {
  id: string
  name: string
  description?: string
}

export default function Subcategorias() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const [subcategorias, setSubcategorias] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubcategorias() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/categories/${categoryId}/subcategories`
        )
        if (!res.ok) throw new Error('Error al cargar subcategorías')

        const data: Subcategory[] = await res.json()
        setSubcategorias(data)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar las subcategorías')
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) fetchSubcategorias()
  }, [categoryId])

  return (
    <div className="min-h-dvh bg-gradient-to-b from-purple-50 via-white to-white">
      <BackHeader title="Subcategorías" />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-12 pt-8">
        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-purple-100 bg-white/90 shadow-xl backdrop-blur">
          <div className="border-b border-purple-100 bg-white/60 px-8 py-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Elige la subcategoría adecuada
            </h2>
            <p className="mt-3 text-sm text-gray-600 md:text-base">
              Así podremos dirigir tu solicitud al equipo correcto.
            </p>
          </div>

          <div className="px-6 py-8">
            {loading && (
              <p className="text-center text-sm text-gray-500 md:text-base">
                Cargando subcategorías...
              </p>
            )}

            {error && (
              <p className="text-center text-sm text-red-500 md:text-base">
                {error}
              </p>
            )}

            {!loading && !error && (
              <>
                {subcategorias.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 md:text-base">
                    No hay subcategorías disponibles para esta categoría.
                  </p>
                ) : (
                  <section className="grid gap-4 md:grid-cols-2">
                    {subcategorias.map(subcategoria => (
                      <CardLink
                        key={subcategoria.id}
                        to={`/formulario/${categoryId}/subcategoria/${subcategoria.id}`}
                        title={subcategoria.name}
                        description={subcategoria.description || 'Continuar con esta opción'}
                      />
                    ))}
                  </section>
                )}
              </>
            )}
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-gray-500">
          Puedes regresar a las categorías anteriores cuando quieras para ajustar tu solicitud.
        </p>
        <div className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-gray-600">
          <Location />  Av. Vicuña Mackenna 4686, Macul, Región Metropolitana
        </div>
      </main>
    </div>
  )
}
