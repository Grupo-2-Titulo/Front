import { useParams } from "react-router-dom"
import BackHeader from "../components/BackHeader"
import CardLink from "../components/CardLink"
import { useEffect, useState } from "react"

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
        if (!res.ok) throw new Error("Error al cargar subcategorías")

        const data: Subcategory[] = await res.json()
        setSubcategorias(data)
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar las subcategorías")
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) fetchSubcategorias()
  }, [categoryId])

  return (
    <div className="min-h-dvh bg-gray-50">
      <BackHeader title="Subcategorías" />

      <main className="mx-auto max-w-4xl px-4 py-10">
        {loading && (
          <p className="text-center text-gray-500">Cargando subcategorías...</p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {subcategorias.length === 0 ? (
              <p className="text-center text-gray-500">
                No hay subcategorías disponibles para esta categoría.
              </p>
            ) : (
              <>
                <p className="text-center text-gray-700 max-w-2xl mx-auto">
                  Selecciona la subcategoría para tu solicitud.
                </p>

                <section className="mt-8 max-w-2xl mx-auto flex flex-col gap-4">
                  {subcategorias.map((s) => (
                    <CardLink
                      key={s.id}
                      to={`/formulario/${categoryId}/subcategoria/${s.id}`}
                      title={s.name}
                      description={s.description || ""}
                    />
                  ))}
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
