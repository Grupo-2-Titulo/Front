const TOP_QUESTIONS = [
  { question: '¿Cuáles son los horarios de atención?', hits: 128 },
  { question: '¿Dónde puedo agendar una hora médica?', hits: 94 },
  { question: '¿Qué coberturas acepta el hospital?', hits: 72 },
  { question: '¿Cómo llego a la sede principal?', hits: 56 }
]

const SESSION_METRICS = [
  { label: 'Promedio de mensajes por sesión', value: '6.3' },
  { label: 'Sesiones activas hoy', value: '142' },
  { label: 'Tiempo medio de respuesta', value: '2.1 s' },
  { label: 'Tasa de satisfacción', value: '92%' }
]

const DAILY_SESSIONS = [
  { day: 'L', label: 'Lunes', sessions: 32 },
  { day: 'M', label: 'Martes', sessions: 48 },
  { day: 'X', label: 'Miércoles', sessions: 41 },
  { day: 'J', label: 'Jueves', sessions: 66 },
  { day: 'V', label: 'Viernes', sessions: 58 },
  { day: 'S', label: 'Sábado', sessions: 72 },
  { day: 'D', label: 'Domingo', sessions: 61 }
]

const WEEK_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const SATISFACTION_POINTS = [
  { label: 'L', score: 88 },
  { label: 'M', score: 90 },
  { label: 'X', score: 91 },
  { label: 'J', score: 92 },
  { label: 'V', score: 94 },
  { label: 'S', score: 95 },
  { label: 'D', score: 93 }
]

const CONVERSATION_OUTCOME = [
  { label: 'Usuario satisfecho', value: 68, color: '#7c3aed' },
  { label: 'Usuario no satisfecho', value: 20, color: '#a855f7' },
  { label: 'No responde', value: 12, color: '#c084fc' }
]

export default function AdminAgent() {
  const maxDailySessions = Math.max(...DAILY_SESSIONS.map(item => item.sessions))
  const minSatisfaction = Math.min(...SATISFACTION_POINTS.map(item => item.score))
  const maxSatisfaction = Math.max(...SATISFACTION_POINTS.map(item => item.score))

  const trendChartBottom = 90
  const trendChartTop = 12
  const trendChartHeight = trendChartBottom - trendChartTop

  const totalOutcome = CONVERSATION_OUTCOME.reduce((sum, segment) => sum + segment.value, 0)
  const pieRadius = 18
  const center = 21
  let cumulativeRatio = 0
  const pieSegments = CONVERSATION_OUTCOME.map(segment => {
    const startRatio = cumulativeRatio
    cumulativeRatio += segment.value / totalOutcome
    const endRatio = cumulativeRatio
    const startAngle = startRatio * 2 * Math.PI
    const endAngle = endRatio * 2 * Math.PI
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

    return { ...segment, pathData }
  })

  const satisfactionRange =
    maxSatisfaction === minSatisfaction ? 1 : maxSatisfaction - minSatisfaction

  return (
    <div className="space-y-8">
      <header className="border-b border-purple-50 pb-4">
        <p className="text-sm uppercase tracking-[0.4em] text-purple-400">Agente virtual</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">Dashboard del agente virtual</h1>
      </header>

      <div className="overflow-hidden rounded-3xl border border-purple-100 bg-white/90 shadow-inner shadow-purple-50/80">
        <section className="grid gap-6 px-8 py-8 md:grid-cols-[1.4fr,1fr]">
          <article className="rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 md:text-base">
              Preguntas más frecuentes
            </h3>

            <ul className="mt-5 space-y-3">
              {TOP_QUESTIONS.map(item => (
                <li
                  key={item.question}
                  className="flex items-start justify-between gap-3 rounded-xl border border-purple-50 bg-gradient-to-r from-purple-50/60 to-white px-4 py-3"
                >
                  <span className="text-sm text-gray-700 md:text-base">{item.question}</span>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                    {item.hits}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="flex flex-col justify-between gap-6 rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 md:text-base">
                Sesiones por día
              </h3>
            </div>

            <div className="flex h-64 flex-col justify-end">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <defs>
                  <linearGradient id="bar-gradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="90" x2="100" y2="90" stroke="#e9d5ff" strokeWidth="1" />
                {DAILY_SESSIONS.map((item, index) => {
                  const slotWidth = 100 / DAILY_SESSIONS.length
                  const gap = 2
                  const barWidth = slotWidth - gap
                  const x = index * slotWidth + gap / 2
                  const height = (item.sessions / maxDailySessions) * 70
                  const y = 90 - height
                  return (
                    <g key={item.day}>
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
                        {item.sessions}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y="96"
                        textAnchor="middle"
                        fontSize="6"
                        fill="#6b7280"
                      >
                        {item.day}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </article>
        </section>

        <section className="grid gap-6 px-8 pb-6 md:grid-cols-2">
          <article className="rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 md:text-base">
                  Porcentaje de usuarios satisfechos por día
                </h3>
              </div>
              <div className="flex items-center justify-center rounded-full bg-purple-100 px-4 py-1 text-xs font-semibold text-purple-700">
                +3 pts
              </div>
            </div>

            <div className="mt-6 h-48 rounded-2xl border border-purple-50 bg-gradient-to-b from-purple-50/60 to-white p-4">
              <div className="h-full w-full">
                <svg viewBox="0 0 200 100" className="h-full w-full">
                  <defs>
                    <linearGradient id="satisfaction-bar" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#c4b5fd" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                  <line
                    x1="20"
                    y1={trendChartBottom}
                    x2="180"
                    y2={trendChartBottom}
                    stroke="#e9d5ff"
                    strokeWidth="1"
                  />
                  {WEEK_LABELS.map((label, index) => {
                    const slotWidth = (180 - 20) / WEEK_LABELS.length
                    const barWidth = slotWidth * 0.6
                    const x = 20 + slotWidth * index + (slotWidth - barWidth) / 2
                    const point = SATISFACTION_POINTS[index]
                    const score = point?.score ?? minSatisfaction
                    const normalized = (score - minSatisfaction) / satisfactionRange
                    const height = normalized * trendChartHeight
                    const y = trendChartBottom - height
                    return (
                      <g key={label}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={height}
                          rx="6"
                          fill="url(#satisfaction-bar)"
                          opacity={label === 'S' || label === 'D' ? 0.35 : 1}
                        />
                        <text
                          x={x + barWidth / 2}
                          y={y - 4}
                          textAnchor="middle"
                          fontSize="8"
                          fill="#7c3aed"
                          fontWeight="600"
                        >
                          {Math.round(score)}%
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={trendChartBottom + 10}
                          textAnchor="middle"
                          fontSize="8"
                          fill={label === 'S' || label === 'D' ? '#d1d5db' : '#6b7280'}
                        >
                          {label}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 md:text-base">
              Porcentaje de satisfacción
            </h3>

            <div className="mt-8 flex flex-col items-center gap-6  md:items-center md:justify-between">
              <div className="grid h-36 w-36 place-items-center">
                <svg viewBox="0 0 42 42" className="h-full w-full">
                  {pieSegments.map(segment => (
                    <path key={segment.label} d={segment.pathData} fill={segment.color} />
                  ))}
                </svg>
              </div>

              <ul className="space-y-2 text-sm">
                {CONVERSATION_OUTCOME.map(segment => (
                  <li key={segment.label} className="flex items-center gap-5">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-gray-600">
                      {segment.label}{' '}
                      <span className="font-semibold text-gray-900">
                        {Math.round((segment.value / totalOutcome) * 100)}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        <section className="grid gap-4 border-t border-purple-50 bg-white/70 px-8 py-8 md:grid-cols-2">
          {SESSION_METRICS.map(metric => (
            <div
              key={metric.label}
              className="rounded-2xl border border-purple-100 bg-white px-5 py-4 shadow-sm transition hover:border-purple-200 hover:shadow"
            >
              <p className="text-xs uppercase tracking-wide text-gray-400">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-purple-700">{metric.value}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
