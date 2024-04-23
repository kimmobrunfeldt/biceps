import { DB } from '@vlcn.io/crsqlite-wasm'
import { TblRx } from '@vlcn.io/rx-tbl'
import { wdbRtc } from '@vlcn.io/sync-p2p'
import { createContext, useContext } from 'react'

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
