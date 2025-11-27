import { type FormEvent, useState } from 'react'

type ManagementView = 'none' | 'add' | 'edit' | 'delete'

type Request = {
  id: string
  bed: string
  room: string
  area: string
  detail: string
  status: string
}

const REQUEST_SUMMARY = {
  total: 248,
  averageResponse: '1 h 12 m',
  deviation: '15 m',
}

const AREA_DISTRIBUTION = [
  { area: 'Cardiología', count: 72 },
  { area: 'Nutrición', count: 56 },
  { area: 'Kinesiología', count: 38 },
  { area: 'Pediatría', count: 30 },
  { area: 'Otros', count: 16 },
]

const INITIAL_REQUESTS: Request[] = [
  { id: 'REQ-01', bed: '1', room: '301-B', area: 'Pediatría', detail: 'No funciona la TV', status: 'En progreso' },
  { id: 'REQ-02', bed: '12', room: '210-A', area: 'Nutrición', detail: 'Dieta especial pendiente', status: 'Asignada' },
  { id: 'REQ-03', bed: '4', room: '105-C', area: 'Kinesiología', detail: 'Acompañamiento solicitado', status: 'Resuelta' },
  { id: 'REQ-04', bed: '7', room: '312-A', area: 'Nutrición', detail: 'Reposición de cama', status: 'Pendiente' },
]

const TIME_RANGES = [
  { range: '07-10 h', count: 32 },
  { range: '10-13 h', count: 58 },
  { range: '13-16 h', count: 44 },
  { range: '16-19 h', count: 66 },
  { range: '19-22 h', count: 30 },
  { range: '22-07 h', count: 18 },
]

const STATUS_OPTIONS = ['Pendiente', 'Asignada', 'En progreso', 'Resuelta', 'Escalada']
const ROOM_TIME_FILTERS = ['Todos', ...TIME_RANGES.map(range => range.range)]
const STATUS_FILTERS = ['Todos', ...STATUS_OPTIONS]

export default function AdminRequests() {
  const [requestList, setRequestList] = useState<Request[]>(INITIAL_REQUESTS)
  const [activeView, setActiveView] = useState<ManagementView>('none')
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('Todos')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('Todos')

  const maxArea = Math.max(...AREA_DISTRIBUTION.map(item => item.count))

  const openModal = (view: ManagementView, request?: Request) => {
    setSelectedRequest(request ?? null)
    setActiveView(view)
  }

  const closeModal = () => {
    setActiveView('none')
    setSelectedRequest(null)
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setRequestList(prev => prev.map(request => (request.id === id ? { ...request, status: newStatus } : request)))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    closeModal()
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-purple-50 pb-4">
        <p className="text-sm uppercase tracking-[0.4em] text-purple-400">Solicitudes</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">Panel de gestión</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/70">
          <p className="text-xs uppercase tracking-[0.4em] text-purple-400">Total</p>
          <h2 className="mt-3 text-4xl font-semibold text-gray-900">{REQUEST_SUMMARY.total}</h2>
          <p className="text-sm text-gray-500">Solicitudes acumuladas esta semana</p>
        </article>
        <article className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/70">
          <p className="text-xs uppercase tracking-[0.4em] text-purple-400">Tiempo de respuesta</p>
          <h2 className="mt-3 text-4xl font-semibold text-gray-900">{REQUEST_SUMMARY.averageResponse}</h2>
          <p className="text-sm text-gray-500">Promedio general</p>
        </article>
        <article className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/70">
          <p className="text-xs uppercase tracking-[0.4em] text-purple-400">Desviación estándar</p>
          <h2 className="mt-3 text-4xl font-semibold text-gray-900">{REQUEST_SUMMARY.deviation}</h2>
          <p className="text-sm text-gray-500">Variación en los tiempos de respuesta</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <article className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Solicitudes por área</h3>
            </div>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              {AREA_DISTRIBUTION.length} áreas
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {AREA_DISTRIBUTION.map(item => {
              const percentage = (item.count / maxArea) * 100
              return (
                <div key={item.area}>
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                    <span>{item.area}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-purple-50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Solicitudes por rango horario</h3>
            </div>
            <span className="text-xs uppercase tracking-[0.4em] text-purple-400">24h</span>
          </div>

          <div className="mt-6 h-[240px] overflow-auto rounded-2xl border border-purple-50">
            <table className="min-w-full divide-y divide-purple-50 text-sm">
              <thead className="bg-purple-50/70 text-xs font-semibold uppercase tracking-wide text-purple-600">
                <tr>
                  <th className="px-4 py-3 text-left">Rango horario</th>
                  <th className="px-4 py-3 text-left">Solicitudes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 bg-white text-gray-700">
                {TIME_RANGES.map(range => (
                  <tr key={range.range} className="hover:bg-purple-50/40">
                    <td className="px-4 py-3 font-semibold text-gray-900">{range.range}</td>
                    <td className="px-4 py-3">{range.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Solicitudes por habitación</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openModal('add')}
              className="rounded-2xl bg-purple-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700"
            >
              Añadir solicitud
            </button>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              {requestList.length} registros
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-purple-400">Rango horario</p>
            <select
              value={selectedTimeFilter}
              onChange={(event) => setSelectedTimeFilter(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm font-semibold text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            >
              {ROOM_TIME_FILTERS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-purple-400">Estado</p>
            <select
              value={selectedStatusFilter}
              onChange={(event) => setSelectedStatusFilter(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm font-semibold text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            >
              {STATUS_FILTERS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-auto rounded-2xl border border-purple-50">
          <table className="min-w-full divide-y divide-purple-50 text-sm">
            <thead className="bg-purple-50/70 text-xs font-semibold uppercase tracking-wide text-purple-600">
              <tr>
                <th className="px-4 py-3 text-left">Cama</th>
                <th className="px-4 py-3 text-left">Habitación</th>
                <th className="px-4 py-3 text-left">Área</th>
                <th className="px-4 py-3 text-left">Detalle</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 bg-white text-gray-700">
              {requestList.map(request => (
                <tr key={request.id} className="hover:bg-purple-50/40">
                  <td className="px-4 py-3 font-semibold text-gray-900">{request.bed}</td>
                  <td className="px-4 py-3">{request.room}</td>
                  <td className="px-4 py-3">{request.area}</td>
                  <td className="px-4 py-3">{request.detail}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-2xl border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 focus:border-purple-400 focus:outline-none"
                      value={request.status}
                      onChange={(event) => handleStatusChange(request.id, event.target.value)}
                    >
                      {STATUS_OPTIONS.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openModal('edit', request)}
                        className="rounded-2xl border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal('delete', request)}
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
      </section>

      {activeView !== 'none' && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-purple-100 bg-white p-8 shadow-2xl">
            <header className="mb-6 border-b border-purple-50 pb-4">
              <p className="text-xs uppercase tracking-[0.4em] text-purple-400">Gestión</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                {activeView === 'add' && 'Registrar solicitud'}
                {activeView === 'edit' && `Editar solicitud ${selectedRequest?.id}`}
                {activeView === 'delete' && 'Eliminar solicitud'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeView === 'delete'
                  ? 'Esta acción es definitiva y no se puede deshacer.'
                  : 'Completa los campos para mantener actualizada la información.'}
              </p>
            </header>

            {(activeView === 'add' || activeView === 'edit') && (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="request-bed" className="block text-sm font-semibold text-gray-700">
                      Número de cama
                    </label>
                    <input
                      id="request-bed"
                      type="text"
                      defaultValue={activeView === 'edit' ? selectedRequest?.bed : ''}
                      placeholder="Ej: 12"
                      className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="request-room" className="block text-sm font-semibold text-gray-700">
                      Habitación
                    </label>
                    <input
                      id="request-room"
                      type="text"
                      defaultValue={activeView === 'edit' ? selectedRequest?.room : ''}
                      placeholder="Ej: 301-B"
                      className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="request-area" className="block text-sm font-semibold text-gray-700">
                      Área
                    </label>
                    <input
                      id="request-area"
                      type="text"
                      defaultValue={activeView === 'edit' ? selectedRequest?.area : ''}
                      placeholder="Cardiología, Nutrición..."
                      className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="request-status" className="block text-sm font-semibold text-gray-700">
                      Estado
                    </label>
                    <select
                      id="request-status"
                      defaultValue={activeView === 'edit' ? selectedRequest?.status : STATUS_OPTIONS[0]}
                      className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    >
                      {STATUS_OPTIONS.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="request-detail" className="block text-sm font-semibold text-gray-700">
                    Detalle
                  </label>
                  <textarea
                    id="request-detail"
                    defaultValue={activeView === 'edit' ? selectedRequest?.detail : ''}
                    rows={3}
                    placeholder="Describe el requerimiento"
                    className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

            {activeView === 'delete' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-600">
                  Estás a punto de eliminar la solicitud{' '}
                  <span className="font-semibold text-red-700">{selectedRequest?.id}</span>. Una vez confirmes,
                  esta acción no podrá revertirse.
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
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
