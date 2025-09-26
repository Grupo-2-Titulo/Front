import BackHeader from '../components/BackHeader'
import { Location } from '../icons/Icons'
import { useState } from 'react'

type Message = { from: 'ai' | 'user'; text: string }

export default function Dudas() {
  const [message, setMessage] = useState('')
  const [log, setLog] = useState<Message[]>([
    {
      from: 'ai',
      text: '¡Hola! Soy tu asistente virtual del hospital. ¿En qué puedo ayudarte hoy?'
    }
  ])

  const chips = [
    'Horarios de atención',
    'Ubicación',
    'Contacto del área',
    'Servicios disponibles',
    'Cómo llegar'
  ]

  function send(m?: string) {
    const text = (m ?? message).trim()
    if (!text) return

    // agregar mensaje del usuario
    setLog(prev => [...prev, { from: 'user', text }])
    setMessage('')

    // simular respuesta automática del asistente
    setTimeout(() => {
      setLog(prev => [
        ...prev,
        { from: 'ai', text: `Procesando tu consulta sobre "${text}"...` }
      ])
    }, 800)
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <BackHeader title="Dudas" />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-center text-gray-700">
          Resuelve tus preguntas frecuentes sobre el hospital.<br />
          Nuestro asistente virtual está aquí para ayudarte.
        </p>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
          {/* encabezado */}
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="font-semibold text-gray-900">Asistente Virtual</h2>
          </div>

          {/* log de mensajes */}
          <div className="px-4 py-4 space-y-4">
            <div className="space-y-3">
              {log.map((l, i) => (
                <div
                  key={i}
                  className={`flex ${
                    l.from === 'user' ? 'justify-end' : 'justify-start'
                  } gap-3`}
                >
                  {l.from === 'ai' && (
                    <div className="shrink-0 mt-1 grid place-items-center w-7 h-7 rounded-full bg-gray-900 text-white">
                      <span className="text-[10px]">AI</span>
                    </div>
                  )}

                  <div
                    className={`rounded-xl px-4 py-2 max-w-xs ${
                      l.from === 'user'
                        ? 'bg-purple-700 text-white'
                        : 'bg-gray-50 text-gray-800'
                    }`}
                  >
                    {l.text}
                  </div>
                </div>
              ))}
            </div>

            {/* chips originales */}
            <div className="flex flex-wrap gap-2">
              {chips.map(c => (
                <button
                  key={c}
                  className="px-3 py-1.5 rounded-lg border text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => send(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* input de mensaje */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2">
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => (e.key === 'Enter' ? send() : null)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600/40"
              />
              <button
                onClick={() => send()}
                className="px-4 py-2 rounded-xl bg-purple-700 text-white hover:bg-purple-800"
                aria-label="Enviar"
              >
                ➤
              </button>
            </div>
          </div>
        </div>

        {/* pie de página */}
        <div className="mt-10 text-center text-gray-600 text-sm flex items-center justify-center gap-2">
          <Location /> Sede principal: Av. Salud 1234
        </div>
      </main>
    </div>
  )
}
