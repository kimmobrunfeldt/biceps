import { SYNC_QUERY_PARAM } from 'src/constants'
import { useSearch } from 'wouter'

export function useSyncWithPeerId() {
  const search = useSearch()
  const params = new URLSearchParams(search)
  return params.get(SYNC_QUERY_PARAM)
}
