import { createContext, useContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import type { Bed } from '../types/bed'

export type BedContextValue = {
  encryptedToken: string
  bedId: string
  bedInfo: Bed | null
  loading: boolean
  error: string | null
  setEncryptedToken: Dispatch<SetStateAction<string>>
  setBedId: Dispatch<SetStateAction<string>>
  setBedInfo: Dispatch<SetStateAction<Bed | null>>
}

const noop = () => undefined

const BedContext = createContext<BedContextValue>({
  encryptedToken: '',
  bedId: '',
  bedInfo: null,
  loading: false,
  error: null,
  setEncryptedToken: noop as Dispatch<SetStateAction<string>>,
  setBedId: noop as Dispatch<SetStateAction<string>>,
  setBedInfo: noop as Dispatch<SetStateAction<Bed | null>>
})

export function useBedContext() {
  return useContext(BedContext)
}

export default BedContext
