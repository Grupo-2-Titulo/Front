import { useEffect, useState } from 'react'

import type { Bed } from '../../types/bed'

type ManagementView = 'none' | 'add' | 'edit' | 'delete'

export default function AdminRooms() {
  const [activeView, setActiveView] = useState<ManagementView>('none')
  const [selectedRoom, setSelectedRoom] = useState<Bed | null>(null)

  const [beds, setBeds] = useState<Bed[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ number: '', code: '', sector: '', floor: '' })
  const [modalError, setModalError] = useState<string | null>(null)

  const parseErrorMessage = (errorText: string): string => {
    try {
      const json = JSON.parse(errorText)
      return json.message || errorText
    } catch {
      return errorText
    }
  }

  const API_URL = import.meta.env.VITE_API_URL

  const computeCode = (floor: string, sector: string, number: string) => {
    const num = String(number ?? '').padStart(2, '0')
    return `${String(floor ?? '')}${String(sector ?? '')}${num}`
  }

  const openAdd = () => {
    setSelectedRoom(null)
    const defaultFloor = '1'
    const defaultSector = 'A'
    const defaultNumber = '01'
    setForm({ number: defaultNumber, code: computeCode(defaultFloor, defaultSector, defaultNumber), sector: defaultSector, floor: defaultFloor })
    setActiveView('add')
  }

  const openEdit = (room: Bed) => {
    setSelectedRoom(room)
    const floor = String(room.floor ?? '')
    const sector = String(room.sector ?? '')
    const number = String(room.number ?? '')
    const paddedNumber = number ? String(number).padStart(2, '0') : ''
    const code = room.code ? String(room.code) : (floor && sector && paddedNumber ? computeCode(floor, sector, paddedNumber) : '')
    setForm({ number: paddedNumber, code, sector, floor })
    setActiveView('edit')
  }

  const openDelete = (room: Bed) => {
    setSelectedRoom(room)
    setActiveView('delete')
  }

  const closeView = () => {
    setActiveView('none')
    setSelectedRoom(null)
    setModalError(null)
  }

  async function fetchBeds() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_URL}/beds/all`)
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)

      const data = await res.json()
      // Ordenar por código
      const sorted = Array.isArray(data) ? data.sort((a, b) => {
        const codeA = String(a.code ?? '').toLowerCase()
        const codeB = String(b.code ?? '').toLowerCase()
        return codeA.localeCompare(codeB)
      }) : []
      setBeds(sorted)
    } catch (err) {
      console.error('Error fetching beds:', err)
      const message = err instanceof Error ? err.message : 'No se pudieron cargar las camas'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {  
    void fetchBeds()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function createBed() {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setError('Necesitas iniciar sesión como admin para crear camas')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setModalError(null)

      const res = await fetch(`${API_URL}/protected/beds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ number: form.number, code: form.code, sector: form.sector, floor: form.floor })
      })

      if (!res.ok) {
        const text = await res.text()
        const message = parseErrorMessage(text)
        setModalError(message)
        return
      }

      await fetchBeds()
      closeView()
    } catch (err) {
      console.error(err)
      setModalError(err instanceof Error ? err.message : 'Error creando la cama')
    } finally {
      setLoading(false)
    }
  }

  async function updateBed() {
    if (!selectedRoom) return
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setError('Necesitas iniciar sesión como admin para editar camas')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setModalError(null)

      const res = await fetch(`${API_URL}/protected/beds/by_id/${encodeURIComponent(selectedRoom.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ number: form.number, code: form.code, sector: form.sector, floor: form.floor })
      })

      if (!res.ok) {
        const text = await res.text()
        const message = parseErrorMessage(text)
        setModalError(message)
        return
      }

      await fetchBeds()
      closeView()
    } catch (err) {
      console.error(err)
      setModalError(err instanceof Error ? err.message : 'Error actualizando la cama')
    } finally {
      setLoading(false)
    }
  }

  async function deleteBed() {
    if (!selectedRoom) return
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setError('Necesitas iniciar sesión como admin para eliminar camas')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setModalError(null)

      const res = await fetch(`${API_URL}/protected/beds/by_id/${encodeURIComponent(selectedRoom.id)}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId
        }
      })

      if (!res.ok) {
        const text = await res.text()
        const message = parseErrorMessage(text)
        setModalError(message)
        return
      }

      await fetchBeds()
      closeView()
    } catch (err) {
      console.error(err)
      setModalError(err instanceof Error ? err.message : 'Error eliminando la cama')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-purple-50 pb-4">
        <p className="text-sm uppercase tracking-[0.4em] text-purple-400">Habitaciones</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">Gestión de camas</h1>
      </header>

      <div className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/80">
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Panel</p>
            <h2 className="text-xl font-semibold text-gray-900">Listado de camas</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openAdd}
              className="rounded-2xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700"
            >
              Añadir cama
            </button>
          </div>
        </div>

        <div className="overflow-auto rounded-2xl border border-purple-50">
          <table className="min-w-full divide-y divide-purple-50 text-sm">
            <thead className="bg-purple-50/70 text-xs font-semibold uppercase tracking-wide text-purple-600">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">Piso</th>
                <th scope="col" className="px-4 py-3 text-left">Área</th>
                <th scope="col" className="px-4 py-3 text-left">N° cama</th>
                <th scope="col" className="px-4 py-3 text-left">Código</th>
                <th scope="col" className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 bg-white text-gray-700">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                    Cargando camas...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && beds.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                    No hay camas disponibles.
                  </td>
                </tr>
              )}

              {!loading && !error && beds.map(bed => (
                <tr key={bed.id} className="hover:bg-purple-50/40">
                  <td className="px-4 py-3">{bed.floor ?? ''}</td>
                  <td className="px-4 py-3">{bed.sector ?? ''}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{bed.number ?? bed.code ?? bed.id}</td>
                  <td className="px-4 py-3">{bed.code ?? ''}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(bed)}
                        className="rounded-2xl border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(bed)}
                        className="rounded-2xl border border-red-100 px-3 py-1 text-xs font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50"
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeView !== 'none' && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-purple-100 bg-white p-8 shadow-2xl">
            <header className="mb-6 border-b border-purple-50 pb-4">
              <p className="text-xs uppercase tracking-[0.4em] text-purple-400">Gestión</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                {activeView === 'add' && 'Añadir nueva cama'}
                {activeView === 'edit' && `Editar cama ${selectedRoom?.number ?? selectedRoom?.code ?? ''}`}
                {activeView === 'delete' && 'Confirmar eliminación'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeView === 'delete'
                  ? 'Esta acción es definitiva y no se puede deshacer.'
                  : 'Completa los campos para actualizar la información de la cama.'}
              </p>
            </header>

            {modalError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <p>{modalError}</p>
              </div>
            )}

            {(activeView === 'add' || activeView === 'edit') && (
              <form className="space-y-5" onSubmit={e => e.preventDefault()}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="room-number" className="block text-sm font-semibold text-gray-700">
                      Número de cama
                    </label>
                    <select
                      id="room-number"
                      value={form.number}
                      onChange={e => setForm(prev => ({ ...prev, number: e.target.value, code: computeCode(prev.floor, prev.sector, e.target.value) }))}
                      className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    >
                      {Array.from({ length: 99 }, (_, i) => String(i + 1).padStart(2, '0')).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="room-code" className="block text-sm font-semibold text-gray-700">
                      Código
                    </label>
                    <input
                      id="room-code"
                      type="text"
                      value={form.code}
                      readOnly
                      className="mt-1 w-full rounded-2xl border border-purple-100 bg-gray-50 px-4 py-3 text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="room-sector" className="block text-sm font-semibold text-gray-700">
                    Área
                  </label>
                  <select
                    id="room-sector"
                    value={form.sector}
                    onChange={e => setForm(prev => ({ ...prev, sector: e.target.value, code: computeCode(prev.floor, e.target.value, prev.number) }))}
                    className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    {['A', 'B', 'C', 'D', 'E', 'G'].map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="room-floor" className="block text-sm font-semibold text-gray-700">
                    Piso
                  </label>
                  <select
                    id="room-floor"
                    value={form.floor}
                    onChange={e => setForm(prev => ({ ...prev, floor: e.target.value, code: computeCode(e.target.value, prev.sector, prev.number) }))}
                    className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    {['1', '2', '3', '4'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeView}
                    className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => (activeView === 'add' ? void createBed() : void updateBed())}
                    disabled={loading}
                    className="rounded-2xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700 disabled:opacity-60"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            )}

            {activeView === 'delete' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-600">
                  Estás a punto de eliminar la cama{' '}
                  <span className="font-semibold text-red-700">{selectedRoom?.number ?? selectedRoom?.code}</span>. Una vez confirmes,
                  la información se perderá permanentemente.
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeView}
                    className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteBed()}
                    disabled={loading}
                    className="rounded-2xl border border-red-200 bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-200/80 transition hover:bg-red-600 disabled:opacity-60"
                  >
                    Eliminar definitivamente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
