import BackHeader from '../components/BackHeader'
import { Location } from '../icons/Icons'
import { useState } from 'react'

export default function Dudas() {
  const [message, setMessage] = useState('')
  const [log, setLog] = useState<string[]>([
    '¡Hola! Soy tu asistente virtual del hospital. ¿En qué puedo ayudarte hoy?'
  ])

  const chips = [
    'Horarios de atención', 'Ubicación', 'Contacto del área',
    'Servicios disponibles', 'Cómo llegar'
  ]

  function send(m?: string) {
    const text = (m ?? message).trim()
    if (!text) return
    setLog(prev => [...prev, text])
    setMessage('')
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
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="font-semibold text-gray-900">Asistente Virtual</h2>
          </div>

          <div className="px-4 py-4 space-y-4">
            <div className="space-y-3">
              {log.map((l, i) => (
                <div key={i} className="flex gap-3">
                  <div className="shrink-0 mt-1 grid place-items-center w-7 h-7 rounded-full bg-gray-900 text-white">
                    {/* avatar */}
                    <span className="text-[10px]">AI</span>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-4 py-2 text-gray-800">
                    {l}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
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

        <div className="mt-10 text-center text-gray-600 text-sm flex items-center justify-center gap-2">
          <Location /> Sede principal: Av. Salud 1234
        </div>
      </main>
    </div>
  )
}
