import { useSearch } from 'wouter'

export function usePeerIdToConnect() {
  const search = useSearch()
  const params = new URLSearchParams(search)
  return params.get('peerId')
}
