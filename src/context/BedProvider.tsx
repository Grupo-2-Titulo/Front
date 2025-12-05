import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import BedContext from './BedContext'

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

export default function BedProvider({ children }: BedProviderProps) {
  const [encryptedToken, setEncryptedToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hasWindow = typeof window !== 'undefined'
    const pathname = hasWindow ? window.location.pathname : ''

    if (pathname.startsWith('/admin')) {
      setEncryptedToken('')
      setError(null)
      setLoading(false)
      if (hasWindow) {
        try {
          window.localStorage.removeItem(LOCAL_STORAGE_KEY)
        } catch (storageError) {
          console.error('[BedProvider] Error clearing localStorage:', storageError)
        }
      }
      return
    }

    const tokenFromPath = readTokenFromPathname(pathname)

    if (tokenFromPath) {
      setEncryptedToken(tokenFromPath)
      setError(null)
      setLoading(false)
      if (hasWindow) {
        try {
          window.localStorage.setItem(LOCAL_STORAGE_KEY, tokenFromPath)
        } catch (storageError) {
          console.error('[BedProvider] Failed to store token in localStorage:', storageError)
        }
      }
      return
    }

    if (!hasWindow) {
      setEncryptedToken('')
      setError('No se pudo encontrar un token de cama.')
      setLoading(false)
      return
    }

    try {
      const storedToken = window.localStorage.getItem(LOCAL_STORAGE_KEY) || ''

      if (storedToken) {
        setEncryptedToken(storedToken)
        setError(null)
      } else {
        setEncryptedToken('')
        setError('No se pudo encontrar un token de cama.')
      }
    } catch (storageError) {
      console.error('[BedProvider] Error accessing localStorage:', storageError)
      setEncryptedToken('')
      setError(storageError instanceof Error ? storageError.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      encryptedToken,
      loading,
      error,
      setEncryptedToken
    }),
    [encryptedToken, loading, error]
  )

  return <BedContext.Provider value={value}>{children}</BedContext.Provider>
}
