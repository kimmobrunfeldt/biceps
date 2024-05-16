import { Box, Flex } from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import 'src/App.css'
import { NavBar } from 'src/components/NavBar'
import { useSyncDataModalOpener } from 'src/components/SyncDataModal'
import { RtcContext, useSqlite } from 'src/hooks/useSqlite'
import { getLogger } from 'src/utils/logger'
import { useLocation } from 'wouter'

const logger = getLogger('rtc')

export function App({ children }: { children?: React.ReactNode }) {
  useSyncDataModalOpener()

  const queryClient = useQueryClient()
  const ref = useRef<HTMLDivElement>(null)
  const ctx = useSqlite()
  const [connections, setConnections] = useState<RtcContext>({
    established: [],
    pending: [],
  })
  const [location] = useLocation()

  useEffect(() => {
    const dispose = ctx.rtc.onConnectionsChanged((pending, established) => {
      logger.info('Connections changed', { pending, established })
      setConnections({ pending, established })
      queryClient.invalidateQueries()
    })
    return () => {
      logger.info('Disposing RTC connections listener')
      dispose()
    }
  }, [queryClient, ctx.rtc])

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
