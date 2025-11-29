import { createContext, useContext } from 'react'

import type { Bed } from '../types/bed'

export type BedContextValue = {
  encryptedToken: string
  bedId: string
  bedInfo: Bed | null
  loading: boolean
  error: string | null
  setEncryptedToken: (token: string) => void
  setBedId: (id: string) => void
  setBedInfo: (bed: Bed | null) => void
}

const BedContext = createContext<BedContextValue>({
  encryptedToken: '',
  bedId: '',
  bedInfo: null,
  loading: false,
  error: null,
  setEncryptedToken: () => undefined,
  setBedId: () => undefined,
  setBedInfo: () => undefined
})

export function useBedContext() {
  return useContext(BedContext)
}

export default BedContext
