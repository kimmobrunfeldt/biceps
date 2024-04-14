import { createContext, useContext } from 'react'
import { createLoaders } from 'src/db/dataLoaders'

export const DataLoaderContext = createContext<
  ReturnType<typeof createLoaders> | undefined
>(undefined)

export function useDataLoaders() {
  const context = useContext(DataLoaderContext)
  if (!context) throw new Error('DataLoaders not available in this context')
  return context
}
