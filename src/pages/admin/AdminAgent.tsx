import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://back-kki7.onrender.com'

type CategoryMetric = {
  category_id: string
  total: number
}

type SectorMetric = {
  sector: string
  total: number
}

type BedBreakdown = {
  sector: string
  bed_code: string
  bed_id: string
  total: number
}

type SectorCategoryBreakdown = {
  category_id: string
  total: number
}

type TimeRange = 'last24h' | 'today' | 'last7d' | 'last30d'

const DATE_RANGE_FILTERS: { value: TimeRange; label: string }[] = [
  { value: 'last24h', label: 'Últimas 24 h' },
  { value: 'today', label: 'Hoy' },
  { value: 'last7d', label: 'Últimos 7 días' },
  { value: 'last30d', label: 'Últimos 30 días' }
]

function getDateRange(rangeKey: TimeRange): { start?: string; end?: string } {
  const now = new Date()

  switch (rangeKey) {
    case 'today': {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      return { start: start.toISOString(), end: end.toISOString() }
    }
    case 'last7d': {
      const end = now
      const start = new Date(now)
      start.setDate(start.getDate() - 7)
      return { start: start.toISOString(), end: end.toISOString() }
    }
    case 'last30d': {
      const end = now
      const start = new Date(now)
      start.setDate(start.getDate() - 30)
      return { start: start.toISOString(), end: end.toISOString() }
    }
    case 'last24h':
    default: {
      const end = now
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      return { start: start.toISOString(), end: end.toISOString() }
    }
  }
}

export default function AdminAgent() {
  const [timeRange, setTimeRange] = useState<TimeRange>('last7d')
  const [totalQueries, setTotalQueries] = useState<number>(0)
  const [categoriesData, setCategoriesData] = useState<CategoryMetric[]>([])
  const [sectorsData, setSectorsData] = useState<SectorMetric[]>([])
  const [topBeds, setTopBeds] = useState<BedBreakdown[]>([])
  const [selectedSector, setSelectedSector] = useState<string>('')
  const [sectorCategoryData, setSectorCategoryData] = useState<SectorCategoryBreakdown[]>([])
  const [pieChartSector, setPieChartSector] = useState<string>('') // Filtro para gráfico circular
  const [pieChartCategoryData, setPieChartCategoryData] = useState<CategoryMetric[]>([])
  const [stackedBarData, setStackedBarData] = useState<{ category: string; sectors: { sector: string; total: number }[]; total: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchMetrics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange])

  useEffect(() => {
    if (selectedSector) {
      void fetchSectorCategoryBreakdown(selectedSector)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSector, timeRange])

  useEffect(() => {
    if (pieChartSector) {
      void fetchPieChartSectorData(pieChartSector)
    } else {
      setPieChartCategoryData(categoriesData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pieChartSector, categoriesData, timeRange])

  useEffect(() => {
    if (sectorsData.length > 0) {
      void fetchStackedBarData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectorsData, timeRange])

  async function fetchPieChartSectorData(sector: string) {
    try {
      const { start, end } = getDateRange(timeRange)
      const queryParams = new URLSearchParams()
      if (start) queryParams.append('start', start)
      if (end) queryParams.append('end', end)
      const queryString = queryParams.toString()

      const res = await fetch(
        `${API_URL}/queries/metrics/sector/${encodeURIComponent(sector)}/by-category?${queryString}`
      )
      const data = await res.json()
      const categoriesForSector = data.map((item: any) => ({
        category_id: item.category_id,
        total: Number(item.total) || 0
      })).filter((cat: CategoryMetric) => cat.total > 0)

      categoriesForSector.sort((a: CategoryMetric, b: CategoryMetric) => b.total - a.total)
      setPieChartCategoryData(categoriesForSector)
    } catch (error) {
      console.error('Error fetching pie chart sector data:', error)
      setPieChartCategoryData([])
    }
  }

  async function fetchStackedBarData() {
    try {
      const { start, end } = getDateRange(timeRange)
      const queryParams = new URLSearchParams()
      if (start) queryParams.append('start', start)
      if (end) queryParams.append('end', end)
      const queryString = queryParams.toString()

      // Para cada sector, obtener el desglose por categoría
      const sectorsWithCategories = await Promise.all(
        sectorsData.map(async (sectorItem) => {
          const res = await fetch(
            `${API_URL}/queries/metrics/sector/${encodeURIComponent(sectorItem.sector)}/by-category?${queryString}`
          )
          const data = await res.json()
          return {
            sector: sectorItem.sector,
            categories: data.map((item: any) => ({
              category_id: item.category_id,
              total: Number(item.total) || 0
            }))
          }
        })
      )

      // Reorganizar datos: por categoría, mostrar distribución en sectores
      const categoryMap = new Map<string, { sector: string; total: number }[]>()

      sectorsWithCategories.forEach(({ sector, categories }) => {
        categories.forEach((cat: any) => {
          if (!categoryMap.has(cat.category_id)) {
            categoryMap.set(cat.category_id, [])
          }
          categoryMap.get(cat.category_id)!.push({
            sector,
            total: cat.total
          })
        })
      })

      // Convertir a array y ordenar por total de cada categoría
      const stackedData = Array.from(categoryMap.entries()).map(([category, sectors]) => {
        const totalCategory = sectors.reduce((sum, s) => sum + s.total, 0)
        return {
          category,
          sectors,
          total: totalCategory
        }
      })

      stackedData.sort((a, b) => b.total - a.total)
      setStackedBarData(stackedData.slice(0, 8)) // Top 8 categorías
    } catch (error) {
      console.error('Error fetching stacked bar data:', error)
      setStackedBarData([])
    }
  }

  async function fetchSectorCategoryBreakdown(sector: string) {
    try {
      const { start, end } = getDateRange(timeRange)
      const queryParams = new URLSearchParams()
      if (start) queryParams.append('start', start)
      if (end) queryParams.append('end', end)
      const queryString = queryParams.toString()

      const res = await fetch(
        `${API_URL}/queries/metrics/sector/${encodeURIComponent(sector)}/by-category?${queryString}`
      )
      const data = await res.json()
      setSectorCategoryData(data.map((item: any) => ({
        category_id: item.category_id,
        total: Number(item.total) || 0
      })))
    } catch (error) {
      console.error('Error fetching sector category breakdown:', error)
      setSectorCategoryData([])
    }
  }

  async function fetchMetrics() {
    setLoading(true)
    try {
      const { start, end } = getDateRange(timeRange)
      const queryParams = new URLSearchParams()
      if (start) queryParams.append('start', start)
      if (end) queryParams.append('end', end)
      const queryString = queryParams.toString()

      // 1. Total de consultas
      const totalRes = await fetch(`${API_URL}/queries/metrics/total?${queryString}`)
      const totalData = await totalRes.json()
      setTotalQueries(Number(totalData[0]?.total) || 0)

      // 2. Consultas por sector
      const sectorsRes = await fetch(`${API_URL}/queries/metrics/sector?${queryString}`)
      const sectorsDataRaw = await sectorsRes.json()
      setSectorsData(sectorsDataRaw.map((s: any) => ({
        sector: s.sector,
        total: Number(s.total) || 0
      })))

      // 3. Obtener todas las categorías
      const categoriesRes = await fetch(`${API_URL}/queries/metrics/categories`)
      const allCategories = await categoriesRes.json()

      // 4. Para cada categoría, obtener el total y el breakdown
      const categoryPromises = allCategories.map(async (categoryId: string) => {
        const countRes = await fetch(
          `${API_URL}/queries/metrics/category/${categoryId}?${queryString}`
        )
        const countData = await countRes.json()
        const total = Number(countData[0]?.total) || 0

        const breakdownRes = await fetch(
          `${API_URL}/queries/metrics/category/${categoryId}/breakdown?${queryString}`
        )
        const breakdown = await breakdownRes.json()

        return {
          category_id: categoryId,
          total,
          breakdown
        }
      })

      const categoryResults = await Promise.all(categoryPromises)
      const categoriesWithTotal = categoryResults
        .map(cat => ({
          category_id: cat.category_id,
          total: Number(cat.total) || 0 // Convertir a número explícitamente
        }))
        .filter(cat => cat.total > 0) // Filtrar categorías sin consultas en este período

      // Ordenar por total descendente
      categoriesWithTotal.sort((a, b) => b.total - a.total)
      setCategoriesData(categoriesWithTotal)

      // 5. Obtener top camas/sectores con más preguntas
      // Consolidar todos los breakdowns
      const allBeds: BedBreakdown[] = []
      categoryResults.forEach(cat => {
        cat.breakdown.forEach((bed: any) => {
          allBeds.push({
            sector: bed.sector,
            bed_code: bed.bed_code,
            bed_id: bed.bed_id,
            total: Number(bed.total) || 0
          })
        })
      })

      // Agrupar por bed_id y sumar totales
      const bedMap = new Map<string, BedBreakdown>()
      allBeds.forEach(bed => {
        if (bedMap.has(bed.bed_id)) {
          const existing = bedMap.get(bed.bed_id)!
          existing.total += bed.total
        } else {
          bedMap.set(bed.bed_id, { ...bed })
        }
      })

      const topBedsArray = Array.from(bedMap.values())
      topBedsArray.sort((a, b) => b.total - a.total)
      setTopBeds(topBedsArray.slice(0, 10))
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Datos para el gráfico de barras de sectores
  const maxSectorCount = Math.max(...sectorsData.map(item => item.total), 1)

  // Datos para el gráfico circular de categorías
  const pieRadius = 18
  const center = 21

  const colors = [
    '#7c3aed',
    '#a855f7',
    '#c084fc',
    '#d8b4fe',
    '#e9d5ff',
    '#f3e8ff',
    '#faf5ff',
    '#6b21a8'
  ]

  // Usar datos filtrados por sector o datos generales
  const dataForPieChart = pieChartSector ? pieChartCategoryData : categoriesData

  // Tomar las top 5 categorías y agrupar el resto en "Otros"
  const top5Categories = dataForPieChart.slice(0, 5)
  const otherCategories = dataForPieChart.slice(5)
  const othersTotal = otherCategories.reduce((sum, cat) => sum + cat.total, 0)

  const categoriesForPie = othersTotal > 0
    ? [...top5Categories, { category_id: 'Otros', total: othersTotal }]
    : top5Categories

  const totalForPie = categoriesForPie.reduce((sum, cat) => sum + cat.total, 0)

  const pieSegments = (() => {
    let cumulativeRatio = 0
    return categoriesForPie.map((cat, index) => {
      const startRatio = cumulativeRatio
      const ratio = totalForPie > 0 ? cat.total / totalForPie : 0
      cumulativeRatio += ratio
      let endRatio = cumulativeRatio

      // Si es un círculo completo (100%), ajustar ligeramente para evitar que start === end
      if (ratio >= 0.9999) {
        endRatio = 0.9999
      }

      // Empezar desde arriba (-90 grados = -PI/2)
      const startAngle = startRatio * 2 * Math.PI - Math.PI / 2
      const endAngle = endRatio * 2 * Math.PI - Math.PI / 2
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

      const startX = center + pieRadius * Math.cos(startAngle)
      const startY = center + pieRadius * Math.sin(startAngle)
      const endX = center + pieRadius * Math.cos(endAngle)
      const endY = center + pieRadius * Math.sin(endAngle)

      const pathData = [
        `M ${center} ${center}`,
        `L ${startX} ${startY}`,
        `A ${pieRadius} ${pieRadius} 0 ${largeArc} 1 ${endX} ${endY}`,
        'Z'
      ].join(' ')

      return {
        category_id: cat.category_id,
        total: cat.total,
        percentage: ratio * 100,
        color: colors[index % colors.length],
        pathData
      }
    })
  })()

  // Análisis de recurrencia
  const recurrenceThreshold = 5 // Camas con más de 5 consultas se consideran recurrentes
  const bedsWithRecurrence = topBeds.filter(bed => bed.total > recurrenceThreshold).length
  const recurrencePercentage = topBeds.length > 0
    ? (bedsWithRecurrence / topBeds.length) * 100
    : 0

  // Categorías con más consultas promedio por cama
  const categoryAverages = categoriesData.map(cat => {
    return {
      category: cat.category_id,
      avgPerBed: cat.total / Math.max(topBeds.length, 1)
    }
  }).sort((a, b) => b.avgPerBed - a.avgPerBed).slice(0, 3)

  const totalBeds = topBeds.length
  const avgQueriesPerBed = totalBeds > 0
    ? (totalQueries / totalBeds).toFixed(1)
    : '0'

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-purple-50 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-purple-400">Agente virtual</p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">
            Dashboard del agente virtual
          </h1>
        </div>
        <div className="flex gap-2">
          {DATE_RANGE_FILTERS.map(filter => (
            <button
              key={filter.value}
              onClick={() => setTimeRange(filter.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                timeRange === filter.value
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-purple-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg text-purple-600">Cargando métricas...</div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-purple-100 bg-white/90 shadow-inner shadow-purple-50/80">
          {/* KPI Principal */}
          <section className="border-b border-purple-50 bg-gradient-to-r from-purple-50/60 to-white px-8 py-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-purple-100 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400">Total de Consultas</p>
                <p className="mt-2 text-3xl font-semibold text-purple-700">{totalQueries}</p>
              </div>
              <div className="rounded-2xl border border-purple-100 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Categorías Activas
                </p>
                <p className="mt-2 text-3xl font-semibold text-purple-700">
                  {categoriesData.length}
                </p>
              </div>
              <div className="rounded-2xl border border-purple-100 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400">Sectores Activos</p>
                <p className="mt-2 text-3xl font-semibold text-purple-700">
                  {sectorsData.length}
                </p>
              </div>
            </div>
          </section>

          {/* Análisis de Recurrencia */}
          <section className="border-b border-purple-50 bg-white/70 px-8 py-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 md:text-base">
              Análisis de Recurrencia
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Camas Recurrentes</p>
                    <p className="mt-1 text-2xl font-semibold text-purple-700">
                      {bedsWithRecurrence}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {recurrencePercentage.toFixed(1)}% del total
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Promedio por Cama</p>
                    <p className="mt-1 text-2xl font-semibold text-purple-700">
                      {avgQueriesPerBed}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">consultas/cama</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white px-5 py-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Top Categorías por Cama</p>
                    <div className="mt-2 space-y-1">
                      {categoryAverages.map((cat, idx) => (
                        <div key={cat.category} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">
                            {idx + 1}. {cat.category}
                          </span>
                          <span className="text-sm font-semibold text-purple-600">
                            {cat.avgPerBed.toFixed(1)} avg
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Categorías más frecuentes y Consultas por Sector */}
          <section className="grid gap-6 px-8 py-8 md:grid-cols-[1.4fr,1fr]">
            <article className="rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 md:text-base">
                Categorías más frecuentes
              </h3>

              <ul className="mt-5 space-y-3">
                {categoriesData.slice(0, 5).map(item => (
                  <li
                    key={item.category_id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-purple-50 bg-gradient-to-r from-purple-50/60 to-white px-4 py-3"
                  >
                    <span className="text-sm text-gray-700 md:text-base">
                      {item.category_id}
                    </span>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                      {item.total}
                    </span>
                  </li>
                ))}
                {categoriesData.length === 0 && (
                  <li className="text-center text-sm text-gray-500">
                    No hay datos para este período
                  </li>
                )}
              </ul>
            </article>

            <article className="flex flex-col gap-6 rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-gray-900 md:text-base">
                  Consultas por Sector
                </h3>
                <select
                  value={selectedSector}
                  onChange={e => setSelectedSector(e.target.value)}
                  className="rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                >
                  <option value="">Ver desglose...</option>
                  {sectorsData.map(sector => (
                    <option key={sector.sector} value={sector.sector}>
                      Sector {sector.sector}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSector && sectorCategoryData.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    Categorías en Sector {selectedSector}:
                  </p>
                  <div className="max-h-60 space-y-2 overflow-y-auto">
                    {sectorCategoryData.map(item => {
                      const maxSectorCategory = Math.max(
                        ...sectorCategoryData.map(i => i.total),
                        1
                      )
                      const percentage = (item.total / maxSectorCategory) * 100
                      return (
                        <div
                          key={item.category_id}
                          className="rounded-lg border border-purple-50 bg-gradient-to-r from-purple-50/40 to-white p-3"
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-gray-700">
                              {item.category_id.substring(0, 25)}
                              {item.category_id.length > 25 ? '...' : ''}
                            </span>
                            <span className="text-xs font-semibold text-purple-700">
                              {item.total}
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-purple-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : selectedSector ? (
                <div className="flex h-48 items-center justify-center text-sm text-gray-400">
                  No hay categorías para este sector
                </div>
              ) : (
                <div className="flex h-48 flex-col justify-end">
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <defs>
                      <linearGradient id="bar-gradient" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#c4b5fd" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="90" x2="100" y2="90" stroke="#e9d5ff" strokeWidth="1" />
                    {sectorsData.map((item, index) => {
                      const slotWidth = 100 / Math.max(sectorsData.length, 1)
                      const gap = 2
                      const barWidth = slotWidth - gap
                      const x = index * slotWidth + gap / 2
                      const height = (item.total / maxSectorCount) * 70
                      const y = 90 - height
                      return (
                        <g key={item.sector}>
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={height}
                            rx="2"
                            fill="url(#bar-gradient)"
                          />
                          <text
                            x={x + barWidth / 2}
                            y={y - 3}
                            textAnchor="middle"
                            fontSize="6"
                            fill="#6b21a8"
                            fontWeight="600"
                          >
                            {item.total}
                          </text>
                          <text
                            x={x + barWidth / 2}
                            y="96"
                            textAnchor="middle"
                            fontSize="6"
                            fill="#6b7280"
                          >
                            {item.sector}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>
              )}
            </article>
          </section>

          {/* Gráfico circular de categorías */}
          <section className="px-8 pb-6">
            <article className="rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 md:text-base">
                  Consultas por Categoría
                </h3>
                <select
                  value={pieChartSector}
                  onChange={e => setPieChartSector(e.target.value)}
                  className="rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                >
                  <option value="">Todos los sectores</option>
                  {sectorsData.map(sector => (
                    <option key={sector.sector} value={sector.sector}>
                      Sector {sector.sector}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-center">
                <div className="grid h-64 w-64 place-items-center">
                  {pieSegments.length > 0 ? (
                    <svg viewBox="0 0 42 42" className="h-full w-full">
                      {pieSegments.map(segment => (
                        <path
                          key={segment.category_id}
                          d={segment.pathData}
                          fill={segment.color}
                        />
                      ))}
                    </svg>
                  ) : (
                    <div className="text-sm text-gray-400">Sin datos</div>
                  )}
                </div>

                <div className="flex-1">
                  <ul className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
                    {pieSegments.map(segment => (
                      <li key={segment.category_id} className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="truncate text-xs text-gray-600">
                          {segment.category_id.substring(0, 20)}
                          {segment.category_id.length > 20 ? '...' : ''}{' '}
                          <span className="font-semibold text-gray-900">
                            {Math.round(segment.percentage)}%
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </section>

          {/* Tabla de Top Camas/Sectores */}
          <section className="border-t border-purple-50 bg-white/70 px-8 py-8">
            <article className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-sm font-semibold text-gray-900 md:text-base">
                Top 10 Camas/Sectores con más consultas
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-purple-100 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="pb-3 pr-4">#</th>
                      <th className="pb-3 pr-4">Sector</th>
                      <th className="pb-3 pr-4">Código Cama</th>
                      <th className="pb-3 pr-4">ID Cama</th>
                      <th className="pb-3 text-right">Total Consultas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {topBeds.map((bed, index) => (
                      <tr key={bed.bed_id} className="hover:bg-purple-50/50">
                        <td className="py-3 pr-4 font-medium text-purple-600">{index + 1}</td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                            {bed.sector}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{bed.bed_code}</td>
                        <td className="py-3 pr-4 text-xs text-gray-500">{bed.bed_id}</td>
                        <td className="py-3 text-right font-semibold text-gray-900">
                          {bed.total}
                        </td>
                      </tr>
                    ))}
                    {topBeds.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">
                          No hay datos para este período
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          {/* Gráfico de barras apiladas: Distribución de categorías por sector */}
          <section className="border-t border-purple-50 bg-white/70 px-8 py-8">
            <article className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-sm font-semibold text-gray-900 md:text-base">
                Distribución de Categorías por Sector
              </h3>

              {stackedBarData.length > 0 ? (
                <div className="space-y-4">
                  {stackedBarData.map((item) => {
                    // Colores para sectores
                    const sectorColors: { [key: string]: string } = {}
                    const baseColors = [
                      '#7c3aed', '#a855f7', '#c084fc', '#d8b4fe',
                      '#e9d5ff', '#f3e8ff', '#6b21a8', '#581c87'
                    ]

                    item.sectors.forEach((s) => {
                      if (!sectorColors[s.sector]) {
                        sectorColors[s.sector] = baseColors[Object.keys(sectorColors).length % baseColors.length]
                      }
                    })

                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">{item.category}</span>
                          <span className="text-xs text-gray-500">{item.total} consultas</span>
                        </div>
                        <div className="relative h-8 w-full overflow-hidden rounded-lg bg-gray-100">
                          {(() => {
                            let cumulativePercent = 0
                            return item.sectors.map((sectorItem) => {
                              const percent = (sectorItem.total / item.total) * 100
                              const left = cumulativePercent
                              cumulativePercent += percent

                              return (
                                <div
                                  key={sectorItem.sector}
                                  className="absolute top-0 h-full transition-all hover:opacity-80"
                                  style={{
                                    left: `${left}%`,
                                    width: `${percent}%`,
                                    backgroundColor: sectorColors[sectorItem.sector]
                                  }}
                                  title={`Sector ${sectorItem.sector}: ${sectorItem.total} consultas (${percent.toFixed(1)}%)`}
                                >
                                  {percent > 10 && (
                                    <span className="flex h-full items-center justify-center text-xs font-semibold text-white">
                                      {sectorItem.sector}
                                    </span>
                                  )}
                                </div>
                              )
                            })
                          })()}
                        </div>
                      </div>
                    )
                  })}

                  {/* Leyenda de sectores */}
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-purple-100 pt-4">
                    {(() => {
                      const allSectors = new Set<string>()
                      stackedBarData.forEach(item => {
                        item.sectors.forEach(s => allSectors.add(s.sector))
                      })

                      const baseColors = [
                        '#7c3aed', '#a855f7', '#c084fc', '#d8b4fe',
                        '#e9d5ff', '#f3e8ff', '#6b21a8', '#581c87'
                      ]

                      return Array.from(allSectors).map((sector, idx) => (
                        <div key={sector} className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-sm"
                            style={{ backgroundColor: baseColors[idx % baseColors.length] }}
                          />
                          <span className="text-xs text-gray-600">Sector {sector}</span>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500">
                  No hay datos disponibles para este período
                </div>
              )}
            </article>
          </section>
        </div>
      )}
    </div>
  )
}
