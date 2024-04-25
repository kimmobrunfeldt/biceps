import { Box, Flex } from '@mantine/core'
import { useEffect, useState } from 'react'
import 'src/App.css'
import { NavBar } from 'src/components/NavBar'
import { useSyncDataModalOpener } from 'src/components/SyncDataModal'
import { RtcContext, useSqlite } from 'src/hooks/useSqlite'
import { getLogger } from 'src/utils/logger'

const logger = getLogger('rtc')

export function App({ children }: { children?: React.ReactNode }) {
  useSyncDataModalOpener()
  const ctx = useSqlite()
  const [connections, setConnections] = useState<RtcContext>({
    established: [],
    pending: [],
  })

  useEffect(() => {
    const dispose = ctx.rtc.onConnectionsChanged((pending, established) => {
      logger.info('Connections changed', { pending, established })
      setConnections({ pending, established })
    })
    return () => {
      logger.info('Disposing RTC connections listener')
      dispose()
    }
  }, [ctx.rtc])

  return (
    <RtcContext.Provider value={connections}>
      <Flex w="100%" h="100%">
        <NavBar />

        <Box flex={1} miw={0} style={{ overflow: 'hidden auto' }}>
          <Box>{children}</Box>
        </Box>
      </Flex>
    </RtcContext.Provider>
  )
}
