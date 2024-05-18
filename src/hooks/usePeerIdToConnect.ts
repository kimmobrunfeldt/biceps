import { SYNC_QUERY_PARAM } from 'src/constants'
import { useSearch } from 'wouter'

export function useSyncWithPeerId() {
  const search = useSearch()
  const params = new URLSearchParams(search)
  return params.get(SYNC_QUERY_PARAM)
}

export function useSetSyncWithPeerId() {
  return (peerId: string) => {
    const url = new URL(location.href)
    url.searchParams.set(SYNC_QUERY_PARAM, peerId)
    window.history.pushState(null, '', url.toString())
  }
}
