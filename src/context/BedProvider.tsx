import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import BedContext from './BedContext'
import type { Bed } from '../types/bed'

const API_BASE = 'https://back-5kmt.onrender.com'
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
    console.log('[BedProvider] Current pathname:', pathname)

    const tokenFromPath = readTokenFromPathname(pathname)
    console.log(
      `[BedProvider] Token detected from pathname: "${tokenFromPath}" (length: ${tokenFromPath.length})`
    )

    if (tokenFromPath) {
      console.log('[BedProvider] Valid token from pathname. Saving to state and localStorage.')
      setEncryptedToken(tokenFromPath)
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, tokenFromPath)
        console.log('[BedProvider] Token stored in localStorage.')
      } catch (storageError) {
        console.error('[BedProvider] Failed to store token in localStorage:', storageError)
      }
      return
    }

    try {
      const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) || '' : ''

      if (storedToken) {
        console.log(
          `[BedProvider] Using token fallback from localStorage (length: ${storedToken.length}).`
        )
        setEncryptedToken(storedToken)
        return
      }

      console.warn('[BedProvider] No token found in pathname or localStorage.')
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
      console.log('[BedProvider] encryptedToken vacío. Deteniendo flujo de carga.')
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    console.log('[BedProvider] Iniciando flujo de carga con token:', encryptedToken)

    void (async () => {
      try {
        const encodedToken = encodeURIComponent(encryptedToken)
        console.log(
          `[BedProvider] Llamando GET /beds/by_token/${encodedToken} (token length: ${encryptedToken.length})`
        )

        const bedFromToken = await getBedFromToken(encryptedToken)
        if (cancelled) return
        console.log('[BedProvider] Respuesta /beds/by_token:', bedFromToken)

        if (!bedFromToken.id) {
          throw new Error('La cama no contiene un ID válido')
        }

        console.log('[BedProvider] bedId obtenido del token:', bedFromToken.id)
        setBedId(bedFromToken.id)

        const encodedId = encodeURIComponent(bedFromToken.id)
        console.log(`[BedProvider] Llamando GET /beds/by_id/${encodedId}`)

        const fullBedInfo = await getBedById(bedFromToken.id)
        if (cancelled) return
        console.log('[BedProvider] Respuesta /beds/by_id:', fullBedInfo)

        setBedInfo(fullBedInfo)
        console.log('[BedProvider] bedInfo guardado correctamente.')
      } catch (err) {
        if (cancelled) return
        console.error('[BedProvider] Error durante la carga de la cama:', err, {
          token: encryptedToken
        })
        setBedId('')
        setBedInfo(null)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        if (!cancelled) {
          setLoading(false)
          console.log('[BedProvider] Finalizó flujo de carga. loading = false')
        }
      }
    })()

    return () => {
      cancelled = true
      console.log('[BedProvider] Se canceló el flujo de carga vigente.')
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
