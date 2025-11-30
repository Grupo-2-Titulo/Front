import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import BedContext from './BedContext'
import type { Bed } from '../types/bed'

const API_BASE = import.meta.env.VITE_API_URL || 'https://back-kki7.onrender.com'
const MIN_TOKEN_LENGTH = 10
const LOCAL_STORAGE_KEY = 'bedToken'
const IGNORED_SEGMENTS = new Set([
  '',
  'dudas',
  'solicitudes',
  'login',
  'admin',
  'formulario'
])

type BedProviderProps = {
  children: ReactNode
}

export function readTokenFromPathname(pathname: string): string {
  const sanitized = pathname.trim()
  const trimmed = sanitized.replace(/^\/+/, '')
  const [firstSegmentRaw] = trimmed.split('/')
  const firstSegment = firstSegmentRaw ?? ''
  const lowerSegment = firstSegment.toLowerCase()

  if (!firstSegment || firstSegment.length < MIN_TOKEN_LENGTH) {
    return ''
  }

  if (IGNORED_SEGMENTS.has(lowerSegment)) {
    return ''
  }

  return firstSegment
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

async function getBedFromToken(token: string) {
  const encoded = encodeURIComponent(token)
  return fetchJson<Bed>(`${API_BASE}/beds/by_token/${encoded}`)
}

async function getBedById(bedId: string) {
  const encoded = encodeURIComponent(bedId)
  return fetchJson<Bed>(`${API_BASE}/beds/by_id/${encoded}`)
}

export default function BedProvider({ children }: BedProviderProps) {
  const [encryptedToken, setEncryptedToken] = useState('')
  const [bedId, setBedId] = useState('')
  const [bedInfo, setBedInfo] = useState<Bed | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

    // Si estamos en rutas de admin, no cargar datos de cama
    if (pathname.startsWith('/admin')) {
      setEncryptedToken('')
      setBedId('')
      setBedInfo(null)
      setError(null)
      setLoading(false)
      // Opcionalmente limpiar localStorage
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY)
      } catch (storageError) {
        console.error('[BedProvider] Error clearing localStorage:', storageError)
      }
      return
    }

    const tokenFromPath = readTokenFromPathname(pathname)

    if (tokenFromPath) {
      setEncryptedToken(tokenFromPath)
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, tokenFromPath)
      } catch (storageError) {
        console.error('[BedProvider] Failed to store token in localStorage:', storageError)
      }
      return
    }

    try {
      const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) || '' : ''

      if (storedToken) {
        setEncryptedToken(storedToken)
        return
      }

      setBedId('')
      setBedInfo(null)
      setError('No se pudo encontrar un token de cama.')
      setLoading(false)
    } catch (storageError) {
      console.error('[BedProvider] Error accessing localStorage:', storageError)
      setBedId('')
      setBedInfo(null)
      setError(storageError instanceof Error ? storageError.message : 'Error desconocido')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!encryptedToken) {
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const bedFromToken = await getBedFromToken(encryptedToken)
        if (cancelled) return

        if (!bedFromToken || !bedFromToken.id) {
          throw new Error('Token inválido o cama no encontrada')
        }

        setBedId(bedFromToken.id)

        const fullBedInfo = await getBedById(bedFromToken.id)
        if (cancelled) return

        setBedInfo(fullBedInfo)
      } catch (err) {
        if (cancelled) return
        console.error('[BedProvider] Error durante la carga de la cama:', err)
        setBedId('')
        setBedInfo(null)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [encryptedToken])

  const value = useMemo(
    () => ({
      encryptedToken,
      bedId,
      bedInfo,
      loading,
      error,
      setEncryptedToken,
      setBedId,
      setBedInfo
    }),
    [encryptedToken, bedId, bedInfo, loading, error]
  )

  return <BedContext.Provider value={value}>{children}</BedContext.Provider>
}
