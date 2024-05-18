import { Box, Flex } from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import 'src/App.css'
import { NavBar } from 'src/components/NavBar'
import { useSyncDataModalOpener } from 'src/components/SyncDataModal'
import { RtcContext, useSqlite } from 'src/hooks/useSqlite'
import { getLogger } from 'src/utils/logger'
import { useLocation } from 'wouter'
import {
  useSetSyncWithPeerId,
  useSyncWithPeerId,
} from './hooks/usePeerIdToConnect'
import { useNotifications } from './hooks/useNotification'

const logger = getLogger('rtc')

export function App({ children }: { children?: React.ReactNode }) {
  const queryClient = useQueryClient()
  const ref = useRef<HTMLDivElement>(null)
  const ctx = useSqlite()

  const initialState: RtcContext = {
    established: [],
    pending: [],
  }
  const connectionsRef = useRef<RtcContext>({
    established: [],
    pending: [],
  })
  const [connections, setConnections] = useState<RtcContext>(initialState)
  const [location] = useLocation()
  const { notification } = useNotifications()
  const setPeerIdQuery = useSetSyncWithPeerId()
  const queryPeerId = useSyncWithPeerId()

  const getConnectedPeerId = useCallback(
    // Return using ref so that useSyncDataModalOpener has the latest info available
    () => connectionsRef.current?.established[0],
    [connectionsRef]
  )
  useSyncDataModalOpener(getConnectedPeerId)

  useEffect(() => {
    const dispose = ctx.rtc.onConnectionsChanged((pending, established) => {
      logger.info('Connections changed', { pending, established })

      const newConnections = { pending, established }
      connectionsRef.current = newConnections
      setConnections(newConnections)

      const connectedPeerId = established[0]
      if (established.length > 0 && queryPeerId !== connectedPeerId) {
        notification({
          message: 'Started sync with another device',
          color: 'green',
        })
        setPeerIdQuery(connectedPeerId)
      }
      queryClient.invalidateQueries()
    })
    return () => {
      logger.info('Disposing RTC connections listener')
      dispose()
    }
  }, [queryClient, queryPeerId, setPeerIdQuery, notification, ctx.rtc])

  useEffect(() => {
    ref.current?.scrollTo(0, 0)
  }, [location])

  return (
    <RtcContext.Provider value={connections}>
      <Flex w="100%" h="100%">
        <NavBar />

        <Box ref={ref} flex={1} miw={0} style={{ overflow: 'hidden auto' }}>
          <Box>{children}</Box>
        </Box>
      </Flex>
    </RtcContext.Provider>
  )
}
