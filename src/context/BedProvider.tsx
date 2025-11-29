import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import BedContext from './BedContext'
import type { Bed } from '../types/bed'

const API_BASE = 'https://back-5kmt.onrender.com'
const MIN_TOKEN_LENGTH = 20

type BedProviderProps = {
  children: ReactNode
}

function readTokenFromPathname(pathname: string): string {
  const trimmed = pathname.replace(/^\/+/, '')
  const [firstSegment] = trimmed.split('/') as [string?, ...string[]]

  if (!firstSegment || firstSegment.length <= MIN_TOKEN_LENGTH) {
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
    const initialToken = readTokenFromPathname(window.location.pathname)

    if (!initialToken) {
      setEncryptedToken('')
      setBedId('')
      setBedInfo(null)
      setLoading(false)
      setError(null)
      return
    }

    setEncryptedToken(initialToken)
  }, [])

  useEffect(() => {
    if (!encryptedToken) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const bedFromToken = await getBedFromToken(encryptedToken)
        if (cancelled) return

        if (!bedFromToken.id) {
          throw new Error('La cama no contiene un ID válido')
        }

        setBedId(bedFromToken.id)

        const fullBedInfo = await getBedById(bedFromToken.id)
        if (cancelled) return
        setBedInfo(fullBedInfo)
      } catch (err) {
        if (cancelled) return
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
