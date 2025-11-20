import { useState } from 'react'

type ManagementView = 'none' | 'add' | 'edit' | 'delete'

const ROOMS = [
  { bed: '1', area: 'Cardiología', location: 'Hospital', floor: 'Piso 3' },
  { bed: '2', area: 'Nutrición', location: 'Clínica', floor: 'Piso 2' },
  { bed: '3', area: 'Kinesiología', location: 'Hospital', floor: 'Piso 5' },
]

export default function AdminRooms() {
  const [activeView, setActiveView] = useState<ManagementView>('none')
  const [selectedRoom, setSelectedRoom] = useState<(typeof ROOMS)[number] | null>(null)

  const openAdd = () => {
    setSelectedRoom(null)
    setActiveView('add')
  }

  const openEdit = (room: (typeof ROOMS)[number]) => {
    setSelectedRoom(room)
    setActiveView('edit')
  }

  const openDelete = (room: (typeof ROOMS)[number]) => {
    setSelectedRoom(room)
    setActiveView('delete')
  }

  const closeView = () => {
    setActiveView('none')
    setSelectedRoom(null)
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
                <th scope="col" className="px-4 py-3 text-left">N° cama</th>
                <th scope="col" className="px-4 py-3 text-left">Área</th>
                <th scope="col" className="px-4 py-3 text-left">Ubicación</th>
                <th scope="col" className="px-4 py-3 text-left">Piso</th>
                <th scope="col" className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 bg-white text-gray-700">
              {ROOMS.map(room => (
                <tr key={room.bed} className="hover:bg-purple-50/40">
                  <td className="px-4 py-3 font-semibold text-gray-900">{room.bed}</td>
                  <td className="px-4 py-3">{room.area}</td>
                  <td className="px-4 py-3">{room.location}</td>
                  <td className="px-4 py-3">{room.floor}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(room)}
                        className="rounded-2xl border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(room)}
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
                {activeView === 'edit' && `Editar cama ${selectedRoom?.bed ?? ''}`}
                {activeView === 'delete' && 'Confirmar eliminación'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeView === 'delete'
                  ? 'Esta acción es definitiva y no se puede deshacer.'
                  : 'Completa los campos para actualizar la información de la cama.'}
              </p>
            </header>

            {(activeView === 'add' || activeView === 'edit') && (
              <form className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="room-bed" className="block text-sm font-semibold text-gray-700">
                      Número de cama
                    </label>
                    <input
                      id="room-bed"
                      type="text"
                      defaultValue={activeView === 'edit' ? selectedRoom?.bed : ''}
                      placeholder="Ej: 12A"
                      className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="room-area" className="block text-sm font-semibold text-gray-700">
                      Área
                    </label>
                    <input
                      id="room-area"
                      type="text"
                      defaultValue={activeView === 'edit' ? selectedRoom?.area : ''}
                      placeholder="Ej: Nutrición"
                      className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="room-location" className="block text-sm font-semibold text-gray-700">
                    Ubicación
                  </label>
                  <input
                    id="room-location"
                    type="text"
                    defaultValue={activeView === 'edit' ? selectedRoom?.location : ''}
                    placeholder="Ej: Cama 10 - Torre B"
                    className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div>
                  <label htmlFor="room-floor" className="block text-sm font-semibold text-gray-700">
                    Piso
                  </label>
                  <input
                    id="room-floor"
                    type="text"
                    defaultValue={activeView === 'edit' ? selectedRoom?.floor : ''}
                    placeholder="Ej: Piso 3"
                    className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
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
                    className="rounded-2xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700"
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
                  <span className="font-semibold text-red-700">{selectedRoom?.bed}</span>. Una vez confirmes,
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
                    className="rounded-2xl border border-red-200 bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-200/80 transition hover:bg-red-600"
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
