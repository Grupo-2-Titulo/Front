import { type FormEvent, useState, useEffect } from "react";

type ManagementView = "none" | "add" | "edit" | "delete";

type Request = {
  id: string;
  bed: string;
  room: string;
  area: string;
  floor: string;
  detail: string;
  status: string;
};

const INITIAL_REQUESTS: Request[] = [
  {
    id: "REQ-01",
    bed: "1",
    room: "301-B",
    area: "Pediatría",
    floor: "3",
    detail: "No funciona la TV",
    status: "En progreso",
  },
  {
    id: "REQ-02",
    bed: "12",
    room: "210-A",
    area: "Nutrición",
    floor: "2",
    detail: "Dieta especial pendiente",
    status: "Asignada",
  },
  {
    id: "REQ-03",
    bed: "4",
    room: "105-C",
    area: "Kinesiología",
    floor: "1",
    detail: "Acompañamiento solicitado",
    status: "Resuelta",
  },
  {
    id: "REQ-04",
    bed: "7",
    room: "312-A",
    area: "Nutrición",
    floor: "3",
    detail: "Reposición de cama",
    status: "Pendiente",
  },
];

const STATUS_OPTIONS = [
  "pendiente",
  "asignada",
  "en progreso",
  "resuelta",
  "escalada",
];

const STATUS_FILTERS = ["Todos", ...STATUS_OPTIONS];

const SECTOR_FILTERS = ["Todos", "A", "B", "C", "D"];
const FLOOR_FILTERS = ["Todos", "1", "2", "3", "4"];

const DATE_RANGE_FILTERS = [
  { value: "last24h", label: "Últimas 24 h" },
  { value: "today", label: "Hoy" },
  { value: "last7d", label: "Últimos 7 días" },
];

type RequestSummary = {
  total: number;
  averageResponse: string;
  deviation: string;
};

type AreaItem = {
  area: string;
  count: number;
};

type TimeRangeItem = {
  range: string;
  count: number;
};

function minutesToLabel(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return "0 m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes} m`;
  return `${hours} h ${minutes} m`;
}

function getDateRange(rangeKey: string): { start?: string; end?: string } {
  const now = new Date();

  switch (rangeKey) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start: start.toISOString(), end: end.toISOString() };
    }
    case "last7d": {
      const end = now;
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { start: start.toISOString(), end: end.toISOString() };
    }
    case "last24h":
    default: {
      const end = now;
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return { start: start.toISOString(), end: end.toISOString() };
    }
  }
}

function getAuthHeadersOrNull() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;
  const token = localStorage.getItem("token");

  if (!userId || !token) {
    return null;
  }

  return {
    "x-user-id": userId,
    Authorization: `Bearer ${token}`,
  };
}

export default function AdminRequests() {
  const [summary, setSummary] = useState<RequestSummary>({
    total: 0,
    averageResponse: "-",
    deviation: "-",
  });
  const [areaDistribution, setAreaDistribution] = useState<AreaItem[]>([]);
  const [timeRanges, setTimeRanges] = useState<TimeRangeItem[]>([]);

  const [requestList, setRequestList] = useState<Request[]>(INITIAL_REQUESTS);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ManagementView>("none");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("Todos");

  const [selectedDateRange, setSelectedDateRange] = useState<string>("last24h");
  const [selectedSectorFilter, setSelectedSectorFilter] =
    useState<string>("Todos");
  const [selectedFloorFilter, setSelectedFloorFilter] =
    useState<string>("Todos");

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10); // por ahora es fijo, no hay selector

  const [filtersVisible, setFiltersVisible] = useState<boolean>(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const maxArea =
    areaDistribution.length > 0
      ? Math.max(...areaDistribution.map((item) => item.count))
      : 0;

  useEffect(() => {
    async function loadMetrics() {
      try {
        const authHeaders = getAuthHeadersOrNull();
        if (!authHeaders) {
          console.warn(
            "Necesitas iniciar sesión como admin para ver las métricas",
          );
          return;
        }

        const end = new Date();
        const start = new Date(end.getTime() - 23 * 60 * 60 * 1000);

        const startISO = start.toISOString();
        const endISO = end.toISOString();

        const [totalRes, responseTimeRes, perSectorRes, timeBucketsRes] =
          await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/protected/metrics/total`, {
              method: "GET",
              headers: {
                ...authHeaders,
              },
            }),
            fetch(
              `${import.meta.env.VITE_API_URL}/protected/metrics/tikets_response_time_stats?start=${startISO}&end=${endISO}`,
              {
                method: "GET",
                headers: {
                  ...authHeaders,
                },
              },
            ),
            fetch(
              `${import.meta.env.VITE_API_URL}/protected/metrics/tikets_per_sectors`,
              {
                method: "GET",
                headers: {
                  ...authHeaders,
                },
              },
            ),
            fetch(
              `${import.meta.env.VITE_API_URL}/protected/metrics/tikets_per_times?start=${startISO}&end=${endISO}`,
              {
                method: "GET",
                headers: {
                  ...authHeaders,
                },
              },
            ),
          ]);

        const totalJson: Array<{ total: string | number }> =
          await totalRes.json();
        const total =
          totalJson && totalJson.length > 0 ? Number(totalJson[0].total) : 0;

        const timeJson: {
          avg_seconds: number;
          avg_minutes: number;
          std_seconds: number;
          std_minutes: number;
        } = await responseTimeRes.json();

        const perSectorJson: Array<{ sector: string; total: number }> =
          await perSectorRes.json();

        const timeBucketsJson: Array<{
          bucket: string;
          label: string;
          total: number;
        }> = await timeBucketsRes.json();

        setSummary({
          total,
          averageResponse: minutesToLabel(timeJson.avg_minutes),
          deviation: minutesToLabel(timeJson.std_minutes),
        });

        const mappedAreas = perSectorJson.map((item) => ({
          area: item.sector,
          count: item.total,
        }));
        setAreaDistribution(mappedAreas);

        const mapped = timeBucketsJson
          .map((item) => ({
            range: item.label,
            count: item.total,
            bucket: item.bucket,
          }))
          .sort(
            (a, b) =>
              new Date(a.bucket).getTime() - new Date(b.bucket).getTime(),
          );
        setTimeRanges(mapped.map(({ range, count }) => ({ range, count })));
      } catch (error) {
        console.error("Error cargando métricas", error);
      }
    }

    loadMetrics();
  }, []);

  useEffect(() => {
    async function loadRequests() {
      try {
        setIsLoadingRequests(true);
        setRequestsError(null);

        const authHeaders = getAuthHeadersOrNull();
        if (!authHeaders) {
          setRequestsError(
            "Necesitas iniciar sesión como admin para ver solicitudes",
          );
          setIsLoadingRequests(false);
          return;
        }

        const params = new URLSearchParams();

        // fechas desde el filtro de rango temporal
        const { start, end } = getDateRange(selectedDateRange);
        if (start) params.append("start", start);
        if (end) params.append("end", end);

        // sector
        if (selectedSectorFilter !== "Todos") {
          params.append("sector", selectedSectorFilter);
        }

        // piso
        if (selectedFloorFilter !== "Todos") {
          params.append("floor", selectedFloorFilter);
        }

        // estado
        if (selectedStatusFilter !== "Todos") {
          params.append("status", selectedStatusFilter.toLowerCase());
        }

        // paginación
        params.append("limit", pageSize.toString());
        params.append("offset", ((page - 1) * pageSize).toString());

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/tickets/all?${params.toString()}`,
          {
            method: "GET",
            headers: {
              ...authHeaders,
            },
          },
        );

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`);
        }

        const data: any[] = await res.json();

        const mapped: Request[] = data.map((item) => ({
          id: String(item.id),
          bed: String(item.bed_id ?? item.Bed?.id ?? ""),
          room: String(item.Bed?.code ?? ""),
          area: String(item.Bed?.sector ?? ""),
          floor: String(item.Bed?.floor ?? ""),
          detail: String(item.description ?? item.detail ?? ""),
          status: String(item.status ?? "pendiente"),
        }));

        setRequestList(mapped);
      } catch (error) {
        console.error("Error cargando solicitudes", error);
        setRequestsError("No se pudieron cargar las solicitudes.");
      } finally {
        setIsLoadingRequests(false);
      }
    }

    loadRequests();
  }, [
    selectedDateRange,
    selectedSectorFilter,
    selectedFloorFilter,
    selectedStatusFilter,
    page,
    pageSize,
  ]);

  const openModal = (view: ManagementView, request?: Request) => {
    setSelectedRequest(request ?? null);
    setActiveView(view);
  };

  const closeModal = () => {
    setActiveView("none");
    setSelectedRequest(null);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setRequestList((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status: newStatus } : request,
      ),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveError(null);
    setIsSaving(true);

    if (!selectedRequest) {
      console.warn("No hay selectedRequest al hacer submit");
      setIsSaving(false);
      return;
    }

    const authHeaders = getAuthHeadersOrNull();
    if (!authHeaders) {
      setSaveError(
        "Necesitas iniciar sesión como admin para editar solicitudes",
      );
      setIsSaving(false);
      return;
    }

    let wasSuccessful = false;

    try {
      const formData = new FormData(event.currentTarget);

      // valores nuevos desde el formulario
      const newDescription = String(formData.get("description") ?? "");
      const newBedId = String(formData.get("bed_id") ?? "");
      const newStatus = String(formData.get("status") ?? "");

      const payload = {
        description: newDescription,
        bed_id: newBedId,
        status: newStatus,
      };

      const url = `${import.meta.env.VITE_API_URL}/protected/tickets/by_id/${selectedRequest.id}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`);
      }

      const responseText = await res.text();
      console.log("Respuesta backend PATCH:", responseText);

      // Actualizamos la lista local usando lo que el usuario editó
      setRequestList((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
                ...r,
                bed: newBedId,
                detail: newDescription,
                status: newStatus,
              }
            : r,
        ),
      );

      wasSuccessful = true;
    } catch (error) {
      console.error(error);
      setSaveError("No se pudo guardar la solicitud.");
    } finally {
      setIsSaving(false);
      if (wasSuccessful) {
        closeModal();
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedRequest) {
      console.warn("No hay selectedRequest al eliminar");
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    const authHeaders = getAuthHeadersOrNull();
    if (!authHeaders) {
      setDeleteError(
        "Necesitas iniciar sesión como admin para eliminar solicitudes",
      );
      setIsDeleting(false);
      return;
    }

    try {
      const url = `${import.meta.env.VITE_API_URL}/protected/tickets/by_id/${selectedRequest.id}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          ...authHeaders,
        },
      });

      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`);
      }

      const responseText = await res.text();
      console.log("Respuesta backend DELETE:", responseText);

      setRequestList((prev) => prev.filter((r) => r.id !== selectedRequest.id));

      closeModal();
    } catch (error) {
      console.error(error);
      setDeleteError("No se pudo eliminar la solicitud.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-purple-50 pb-4">
        <p className="text-sm uppercase tracking-[0.4em] text-purple-400">
          Solicitudes
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Panel de gestión
        </h1>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/70">
          <p className="text-xs uppercase tracking-[0.4em] text-purple-400">
            Total
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-gray-900">
            {summary.total}
          </h2>
          <p className="text-sm text-gray-500">
            Solicitudes acumuladas esta semana
          </p>
        </article>
        <article className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/70">
          <p className="text-xs uppercase tracking-[0.4em] text-purple-400">
            Tiempo de respuesta
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-gray-900">
            {summary.averageResponse}
          </h2>
          <p className="text-sm text-gray-500">Promedio general</p>
        </article>
        <article className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/70">
          <p className="text-xs uppercase tracking-[0.4em] text-purple-400">
            Desviación estándar
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-gray-900">
            {summary.deviation}
          </h2>
          <p className="text-sm text-gray-500">
            Variación en los tiempos de respuesta
          </p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <article className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Solicitudes por área
              </h3>
            </div>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              {areaDistribution.length} áreas
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {areaDistribution.map((item) => {
              const percentage = maxArea ? (item.count / maxArea) * 100 : 0;
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
              );
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-inner shadow-purple-50/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Solicitudes por rango horario
              </h3>
            </div>
            <span className="text-xs uppercase tracking-[0.4em] text-purple-400">
              24h
            </span>
          </div>

          <div className="mt-6 h-[240px] overflow-auto rounded-2xl border border-purple-50">
            <table className="min-w-full divide-y divide-purple-50 text-sm">
              <thead className="bg-purple-50/70 text-xs font-semibold uppercase tracking-wide text-purple-600">
                <tr>
                  <th className="px-4 py-3 text-left">Rango horario</th>
                  <th className="px-4 py-3 text-left">Solicitudes</th>
                  <th className="px-4 py-3 text-left">Nivel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 bg-white text-gray-700">
                {timeRanges.map((range) => (
                  <tr key={range.range}>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {range.range}
                    </td>
                    <td className="px-4 py-3">{range.count}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                        {range.count > 50
                          ? "Alta"
                          : range.count > 30
                            ? "Media"
                            : "Baja"}
                      </span>
                    </td>
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
            <h3 className="text-lg font-semibold text-gray-900">
              Solicitudes por habitación
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openModal("add")}
              className="rounded-2xl bg-purple-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700"
            >
              Añadir solicitud
            </button>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              {requestList.length} registros
            </span>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-400">
            Filtros avanzados
          </p>
          <button
            type="button"
            onClick={() => setFiltersVisible((prev) => !prev)}
            className="rounded-2xl border border-purple-200 bg-white px-4 py-2 text-xs font-semibold text-purple-700 shadow-sm transition hover:border-purple-300 hover:bg-purple-50"
          >
            {filtersVisible ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
        </div>

        {filtersVisible && (
          <div className="mt-4 rounded-2xl border border-purple-50 bg-purple-50/30 px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Rango temporal -> start / end */}
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.4em] text-purple-400">
                  Rango temporal
                </p>
                <select
                  value={selectedDateRange}
                  onChange={(event) => {
                    setPage(1);
                    setSelectedDateRange(event.target.value);
                  }}
                  className="h-11 w-full rounded-2xl border border-purple-100 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                >
                  {DATE_RANGE_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector */}
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.4em] text-purple-400">
                  Sector
                </p>
                <select
                  value={selectedSectorFilter}
                  onChange={(event) => {
                    setPage(1);
                    setSelectedSectorFilter(event.target.value);
                  }}
                  className="h-11 w-full rounded-2xl border border-purple-100 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                >
                  {SECTOR_FILTERS.map((option) => (
                    <option key={option} value={option}>
                      {option === "Todos" ? "Todos" : `Sector ${option}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Piso */}
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.4em] text-purple-400">
                  Piso
                </p>
                <select
                  value={selectedFloorFilter}
                  onChange={(event) => {
                    setPage(1);
                    setSelectedFloorFilter(event.target.value);
                  }}
                  className="h-11 w-full rounded-2xl border border-purple-100 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                >
                  {FLOOR_FILTERS.map((option) => (
                    <option key={option} value={option}>
                      {option === "Todos" ? "Todos" : `Piso ${option}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado -> status */}
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.4em] text-purple-400">
                  Estado
                </p>
                <select
                  value={selectedStatusFilter}
                  onChange={(event) => {
                    setPage(1);
                    setSelectedStatusFilter(event.target.value);
                  }}
                  className="h-11 w-full rounded-2xl border border-purple-100 bg-white px-4 text-sm font-semibold text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                >
                  {STATUS_FILTERS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 overflow-auto rounded-2xl border border-purple-50">
          <table className="min-w-full divide-y divide-purple-50 text-sm">
            <thead className="bg-purple-50/70 text-xs font-semibold uppercase tracking-wide text-purple-600">
              <tr>
                <th className="px-4 py-3 text-left">Cama ID</th>
                <th className="px-4 py-3 text-left">Habitación</th>
                <th className="px-4 py-3 text-left">Piso</th>
                <th className="px-4 py-3 text-left">Sector</th>
                <th className="px-4 py-3 text-left">Detalle</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 bg-white text-gray-700">
              {requestList.map((request) => (
                <tr key={request.id} className="hover:bg-purple-50/40">
                  {/* Cama */}
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {request.bed}
                  </td>

                  {/* Habitación (code) */}
                  <td className="px-4 py-3">{request.room}</td>

                  {/* Piso */}
                  <td className="px-4 py-3">{request.floor}</td>

                  {/* Sector */}
                  <td className="px-4 py-3">{request.area}</td>

                  {/* Detalle */}
                  <td className="px-4 py-3">{request.detail}</td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <select
                      className="rounded-2xl border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 focus:border-purple-400 focus:outline-none"
                      value={request.status}
                      onChange={(event) =>
                        handleStatusChange(request.id, event.target.value)
                      }
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openModal("edit", request)}
                        className="rounded-2xl border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal("delete", request)}
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

          {isLoadingRequests && (
            <div className="p-4 text-sm text-gray-500">
              Cargando solicitudes...
            </div>
          )}
          {requestsError && (
            <div className="p-4 text-sm text-red-600">{requestsError}</div>
          )}
        </div>
      </section>

      {activeView !== "none" && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-purple-100 bg-white p-8 shadow-2xl">
            <header className="mb-6 border-b border-purple-50 pb-4">
              <p className="text-xs uppercase tracking-[0.4em] text-purple-400">
                Gestión
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                {activeView === "add" && "Registrar solicitud"}
                {activeView === "edit" &&
                  `Editar solicitud ${selectedRequest?.id}`}
                {activeView === "delete" && "Eliminar solicitud"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeView === "delete"
                  ? "Esta acción es definitiva y no se puede deshacer."
                  : "Completa los campos para mantener actualizada la información."}
              </p>
            </header>

            {(activeView === "add" || activeView === "edit") && (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* FILA 1: Cama / Habitación / Piso */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="request-bed"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Cama
                    </label>
                    <input
                      id="request-bed"
                      name="bed_id"
                      type="text"
                      defaultValue={
                        activeView === "edit" ? selectedRequest?.bed : ""
                      }
                      placeholder="Ej: 02"
                      className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="request-room"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Habitación (código)
                    </label>
                    <input
                      id="request-room"
                      type="text"
                      defaultValue={
                        activeView === "edit" ? selectedRequest?.room : ""
                      }
                      placeholder="Ej: 1B02"
                      readOnly
                      className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="request-floor"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Piso
                    </label>
                    <input
                      id="request-floor"
                      type="text"
                      defaultValue={
                        activeView === "edit" ? selectedRequest?.floor : ""
                      }
                      placeholder="Ej: 1"
                      readOnly
                      className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* FILA 2: Sector / Estado */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="request-area"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Sector
                    </label>
                    <input
                      id="request-area"
                      type="text"
                      defaultValue={
                        activeView === "edit" ? selectedRequest?.area : ""
                      }
                      placeholder="Ej: A, B, C..."
                      readOnly
                      className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="request-status"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Estado
                    </label>
                    <select
                      id="request-status"
                      name="status"
                      defaultValue={
                        activeView === "edit"
                          ? selectedRequest?.status
                          : STATUS_OPTIONS[0]
                      }
                      className="mt-1 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Detalle */}
                <div>
                  <label
                    htmlFor="request-detail"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Detalle
                  </label>
                  <textarea
                    id="request-detail"
                    name="description"
                    defaultValue={
                      activeView === "edit" ? selectedRequest?.detail : ""
                    }
                    rows={3}
                    placeholder="Describe el requerimiento"
                    className="mt-1 w-full rounded-2xl border border-purple-100 px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {saveError && (
                  <p className="text-sm text-red-600">{saveError}</p>
                )}

                {/* BOTONES */}
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
                    disabled={isSaving}
                    className="rounded-2xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-300/60 transition hover:bg-purple-700 disabled:opacity-60"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

            {activeView === "delete" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-600">
                  Estás a punto de eliminar la solicitud{" "}
                  <span className="font-semibold text-red-700">
                    {selectedRequest?.id}
                  </span>
                  . Una vez confirmes, esta acción no podrá revertirse.
                </div>

                {deleteError && (
                  <p className="text-sm text-red-600">{deleteError}</p>
                )}

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
                    onClick={handleDelete}
                    disabled={isDeleting}
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
  );
}
