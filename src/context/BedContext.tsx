import { createContext, useContext } from 'react'

import type { Bed } from '../types/bed'

type BedContextValue = {
  encryptedToken: string
  bedId: string
  bedInfo: Bed | null
  loading: boolean
  error: string | null
}

const BedContext = createContext<BedContextValue>({
  encryptedToken: '',
  bedId: '',
  bedInfo: null,
  loading: false,
  error: null
})

export function useBedContext() {
  return useContext(BedContext)
}

export default BedContext
