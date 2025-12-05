import { createContext, useContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export type BedContextValue = {
  encryptedToken: string
  loading: boolean
  error: string | null
  setEncryptedToken: Dispatch<SetStateAction<string>>
}

const noop = () => undefined

const BedContext = createContext<BedContextValue>({
  encryptedToken: '',
  loading: false,
  error: null,
  setEncryptedToken: noop as Dispatch<SetStateAction<string>>
})

export function useBedContext() {
  return useContext(BedContext)
}

export default BedContext
