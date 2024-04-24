import { DB } from '@vlcn.io/crsqlite-wasm'
import { TblRx } from '@vlcn.io/rx-tbl'
import { wdbRtc } from '@vlcn.io/sync-p2p'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

export type DatabaseContext = {
  db: DB
  siteid: string
  rx: TblRx
  rtc: Awaited<ReturnType<typeof wdbRtc>>
}

export const DatabaseContext = createContext<DatabaseContext | null>(null)

export function useSqlite() {
  const context = useContext(DatabaseContext)
  if (!context) throw new Error('DatabaseContext not available in this context')
  return context
}

/**
 * Provides a convenient hook to know when a table has been updated. The returned
 * Date can be used as a react query cache key to trigger new data fetch.
 */
export function useTableLastUpdatedAt(tableNames: string[]) {
  const ctx = useSqlite()
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

  const onUpdate = useCallback(() => {
    setLastUpdatedAt(new Date())
  }, [setLastUpdatedAt])

  // In case DB connection or table names change, re-subscribe to table updates
  const disposer = useRef<(() => void) | null>(null)
  useEffect(() => {
    disposer.current = ctx.rx.onRange(tableNames, onUpdate)
    return () => {
      // On hook disposal (e.g. unmount or dep change) dispose the previous subscription
      disposer.current?.()
      disposer.current = null
    }
  }, [ctx.rx, tableNames, onUpdate])

  return lastUpdatedAt
}
