import BackHeader from "../components/BackHeader"
import CardLink from "../components/CardLink"
import { useEffect, useState } from "react"

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
        if (!res.ok) throw new Error("Error al cargar categorías")

        const data = await res.json()
        setCategorias(data)
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar las categorías")
      } finally {
        setLoading(false)
      }
    }

    fetchCategorias()
  }, [])

  return (
    <div className="min-h-dvh bg-gray-50">
      <BackHeader title="Solicitudes" />

      <main className="mx-auto max-w-4xl px-4 py-10">
        {loading && (
          <p className="text-center text-gray-500">Cargando categorías...</p>
        )}
        {error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {!loading && !error && (
          <>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              Selecciona el tipo de solicitud que necesitas.
            </p>

            <section className="mt-8 max-w-2xl mx-auto flex flex-col gap-4">
              {categorias.map((c) => (
                <CardLink
                  key={c.id}
                  to={`/formulario/${c.id}`}
                  title={c.name}
                  description={c.description || ""}
                />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
