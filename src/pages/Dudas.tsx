import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import BackHeader from '../components/BackHeader'
import { Location, ThumbDown, ThumbUp } from '../icons/Icons'

type Message = {
  id: string
  role: 'assistant' | 'user'
  content: string
  pending?: boolean
  error?: boolean
}

type SectionOption = { id: string; label: string }

const LOGO_URL =
  'https://d328k6xhl3lmif.cloudfront.net/images/default-source/p-100-images/logos/uclogo.png?sfvrsn=892c35e5_1'

const DEFAULT_PROMPTS = [
  '¿Cuáles son los horarios de atención?',
  '¿Dónde están ubicadas las clínicas?',
  'Necesito el número del área de pediatría',
  '¿Qué servicios están disponibles?',
  '¿Cómo llego a la sede principal?',
  '¿Dónde hago un reclamo o sugerencia?'
]

const CONTACT_REGEX =
  /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})|(\+?\d[\d\s().-]{6,}\d)/gi

function createId() {
  return Math.random().toString(36).slice(2)
}

function extractAnswer(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const record = payload as Record<string, unknown>
  const candidates = ['answer', 'response', 'result', 'message', 'content', 'output']
  for (const key of candidates) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value
  }

  if (Array.isArray(record.choices)) {
    const first = record.choices[0]
    if (first && typeof first === 'object') {
      const text =
        typeof (first as Record<string, unknown>).message === 'object' &&
        (first as Record<string, unknown>).message !== null &&
        typeof (first as Record<string, unknown>).message === 'object' &&
        'content' in ((first as Record<string, unknown>).message as object)
          ? (((first as Record<string, unknown>).message as Record<string, unknown>)
              .content as string)
          : ((first as Record<string, unknown>).text as string | undefined)
      if (typeof text === 'string' && text.trim()) return text
    }
  }

  return ''
}

function normalizeSections(payload: unknown): SectionOption[] {
  const results: SectionOption[] = []
  const seen = new Set<string>()

  const register = (id: string, label: string) => {
    const cleanId = id.trim()
    const cleanLabel = label.trim()
    if (!cleanId || !cleanLabel || seen.has(cleanId)) return
    results.push({ id: cleanId, label: cleanLabel })
    seen.add(cleanId)
  }

  const dig = (entry: unknown) => {
    if (!entry) return
    if (Array.isArray(entry)) {
      entry.forEach(dig)
      return
    }

    if (typeof entry === 'string') {
      register(entry, entry)
      return
    }

    if (typeof entry === 'object') {
      const obj = entry as Record<string, unknown>
      const potentialId =
        [obj.id, obj.section_id, obj.section, obj.slug, obj.value].find(
          v => typeof v === 'string' && v.trim()
        ) ?? null
      const potentialLabel =
        [obj.label, obj.name, obj.title, obj.section, obj.id].find(
          v => typeof v === 'string' && v.trim()
        ) ?? null

      if (typeof potentialId === 'string' && typeof potentialLabel === 'string') {
        register(potentialId, potentialLabel)
      }

      if ('children' in obj) dig(obj.children)
      if ('subsections' in obj) dig(obj.subsections)
      if ('items' in obj) dig(obj.items)
    }
  }

  dig(payload)
  return results
}

function formatAssistantContent(content: string): ReactNode {
  const matcher = new RegExp(CONTACT_REGEX)
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let fragmentCounter = 0

  while ((match = matcher.exec(content)) !== null) {
    const fullMatch = match[0]
    const start = match.index

    if (start > lastIndex) {
      parts.push(
        <Fragment key={`text-${fragmentCounter++}`}>
          {content.slice(lastIndex, start)}
        </Fragment>
      )
    }

    if (match[1]) {
      const email = match[1]
      parts.push(
        <a
          key={`email-${start}`}
          href={`mailto:${email}`}
          className="font-medium text-purple-700 underline underline-offset-2"
        >
          {fullMatch}
        </a>
      )
    } else if (match[2]) {
      const digits = fullMatch.replace(/\D/g, '')
      if (digits.length >= 7) {
        const telValue = fullMatch.replace(/[^\d+]/g, '')
        const normalized =
          telValue.startsWith('+')
            ? `+${telValue.slice(1).replace(/\+/g, '')}`
            : telValue.replace(/\+/g, '')

        parts.push(
          <a
            key={`phone-${start}`}
            href={`tel:${normalized}`}
            className="font-medium text-purple-700 underline underline-offset-2"
          >
            {fullMatch}
          </a>
        )
      } else {
        parts.push(<Fragment key={`text-${fragmentCounter++}`}>{fullMatch}</Fragment>)
      }
    }

    lastIndex = start + fullMatch.length
  }

  if (!parts.length) return content

  if (lastIndex < content.length) {
    parts.push(
      <Fragment key={`text-${fragmentCounter++}`}>
        {content.slice(lastIndex)}
      </Fragment>
    )
  }

  return parts
}

export default function Dudas() {
  const ragApiUrl = import.meta.env.VITE_RAG_API_URL?.replace(/\/$/, '')
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: createId(),
      role: 'assistant',
      content:
        '¡Hola! Soy tu asistente virtual del hospital. Estoy conectada a nuestra base de conocimiento para ayudarte. ¿Qué necesitas saber hoy?'
    }
  ])
  const [sections, setSections] = useState<SectionOption[]>([])
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null)
  const conversationRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!ragApiUrl) return
    let active = true
    ;(async () => {
      try {
        const res = await fetch(`${ragApiUrl}/sections`)
        if (!res.ok) throw new Error('No se pudo obtener la lista de secciones')
        const data = await res.json()
        if (!active) return
        const normalized = normalizeSections(data)
        if (normalized.length) setSections(normalized.slice(0, 8))
      } catch (error) {
        console.error('Error al cargar secciones de RAG', error)
      }
    })()
    return () => {
      active = false
    }
  }, [ragApiUrl])

  useEffect(() => {
    if (!conversationRef.current) return
    conversationRef.current.scrollTop = conversationRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!textareaRef.current) return
    const el = textareaRef.current
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [input])

  const quickPrompts =
    sections.length > 0 ? sections.map(s => s.label) : DEFAULT_PROMPTS

  async function handleSend(prompt?: string) {
    const text = (prompt ?? input).trim()
    if (!text || isLoading) return

    setInput('')
    setFetchError(null)

    const userMessage: Message = { id: createId(), role: 'user', content: text }
    const placeholderId = createId()
    setMessages(prev => [
      ...prev,
      userMessage,
      { id: placeholderId, role: 'assistant', content: '', pending: true }
    ])

    if (!ragApiUrl) {
      setMessages(prev =>
        prev.map(m =>
          m.id === placeholderId
            ? {
                ...m,
                content:
                  'El servicio de IA no está configurado. Por favor, contacta al equipo técnico.',
                pending: false,
                error: true
              }
            : m
        )
      )
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${ragApiUrl}/chat/general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      })

      if (!response.ok) {
        throw new Error('No se pudo obtener respuesta de la IA')
      }

      const data = await response.json()
      const answer = extractAnswer(data)

      setMessages(prev =>
        prev.map(m =>
          m.id === placeholderId
            ? {
                ...m,
                content:
                  answer ||
                  'No encontré información para esta consulta, pero puedes volver a intentarlo reformulando tu pregunta.',
                pending: false
              }
            : m
        )
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pudimos completar tu solicitud.'
      setFetchError(message)

      setMessages(prev =>
        prev.map(m =>
          m.id === placeholderId
            ? {
                ...m,
                content: `Lo siento, ocurrió un problema al consultar la base de conocimiento. ${message}`,
                pending: false,
                error: true
              }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-purple-50 via-white to-white">
      <BackHeader title="Asistente Virtual" />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-12 pt-8">
        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-purple-100 bg-white/90 shadow-xl backdrop-blur">
          <div className="flex flex-wrap items-center gap-4 border-b border-purple-100 bg-white/60 px-6 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <img
                src={LOGO_URL}
                alt="Logo UC Christus"
                className="h-10 w-10 object-contain"
              />
            </div>

            <div className="grid flex-1 gap-4 md:grid-cols-2 md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Asistente UC Christus
                </h2>
                <p className="text-sm text-gray-500">
                  Respuestas inmediatas conectadas a nuestra base de conocimiento.
                </p>
              </div>

              <div className="flex items-center justify-start gap-3 text-sm text-gray-700 md:justify-end">
                <span className="font-medium text-gray-900">
                  ¿Se resolvió tu duda?
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Sí, se resolvió mi duda"
                    aria-pressed={feedback === 'like'}
                    onClick={() =>
                      setFeedback(feedback === 'like' ? null : 'like')
                    }
                    className={[
                      'rounded-full border px-3 py-1 transition',
                      feedback === 'like'
                        ? 'border-purple-200 bg-purple-700 text-white'
                        : 'border-purple-100 bg-white text-purple-700 hover:border-purple-200 hover:bg-purple-50'
                    ].join(' ')}
                  >
                    <ThumbUp size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="No, aún tengo dudas"
                    aria-pressed={feedback === 'dislike'}
                    onClick={() =>
                      setFeedback(feedback === 'dislike' ? null : 'dislike')
                    }
                    className={[
                      'rounded-full border px-3 py-1 transition',
                      feedback === 'dislike'
                        ? 'border-red-200 bg-red-100 text-red-700'
                        : 'border-purple-100 bg-white text-purple-700 hover:border-purple-200 hover:bg-purple-50'
                    ].join(' ')}
                  >
                    <ThumbDown size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            ref={conversationRef}
            className="flex max-h-[60vh] flex-1 flex-col gap-5 overflow-y-auto px-6 py-6"
          >
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={[
                    'max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition',
                    message.role === 'user'
                      ? 'bg-purple-700 text-white'
                      : message.error
                      ? 'border border-red-200 bg-red-50 text-red-700'
                      : 'bg-gray-100 text-gray-800'
                  ].join(' ')}
                >
                  {message.pending ? (
                    <span className="flex items-center gap-2 text-gray-500">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></span>
                    </span>
                  ) : message.role === 'assistant' ? (
                    formatAssistantContent(message.content)
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-purple-100 bg-white/60 px-6 py-4">
            <div className="flex flex-wrap gap-2 pb-4">
              {quickPrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-purple-200 px-3 py-1.5 text-xs text-purple-700 transition hover:bg-purple-50"
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {fetchError && (
              <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
                {fetchError}
              </p>
            )}

            <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-white px-4 py-3 shadow-inner focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100">
              <div className="relative flex-1">
                {!input.trim() && (
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    Escribe tu consulta... (Enter para enviar, Shift + Enter para nueva línea)
                  </span>
                )}
                <textarea
                  ref={textareaRef}
                  value={input}
                  rows={1}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  className="max-h-36 w-full resize-none bg-transparent py-3 pl-4 pr-2 text-sm text-gray-800 outline-none"
                  aria-label="Mensaje para el asistente virtual"
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="rounded-xl bg-purple-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-300"
                aria-label="Enviar mensaje"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-3xl text-center">
          <p className="text-sm text-gray-500">
            ¿Necesitas realizar un requerimiento puntual? Pasa a la sección de{' '}
            <span className="font-medium text-purple-700">solicitudes</span>.
          </p>

          <Link
            to="/solicitudes"
            className="mx-auto mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-purple-200 bg-white/80 px-5 py-3 text-sm font-medium text-purple-700 shadow-sm transition hover:bg-purple-50"
          >
            Ir a solicitudes
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-gray-600">
          <Location /> Av. Vicuña Mackenna 4686, Macul, Región Metropolitana
        </div>
      </main>
    </div>
  )
}
