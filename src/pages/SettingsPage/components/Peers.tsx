import { Box, Flex, Text } from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useSqlite } from 'src/hooks/useSqlite.js'

export default function Peers() {
  const ctx = useSqlite()
  const [pending, setPending] = useState<string[]>([])
  const [established, setEstablished] = useState<string[]>([])

  useEffect(() => {
    const cleanup = ctx.rtc.onConnectionsChanged((pending, established) => {
      setPending(pending)
      setEstablished(established)
    })
    return () => {
      cleanup()
    }
  }, [ctx.rtc])

  return (
    <Box>
      {pending.length === 0 && established.length === 0 && (
        <Text>No open connections</Text>
      )}
      <ul>
        {pending.map((pendingId) => (
          <Flex component="li" key={pendingId} id={pendingId} align="center">
            <IconAlertCircle /> <Text>{pendingId}</Text>
          </Flex>
        ))}
      </ul>
      <ul>
        {established.map((connectedId) => (
          <Flex
            component="li"
            key={connectedId}
            id={connectedId}
            align="center"
          >
            <IconCheck /> <Text>{connectedId}</Text>
          </Flex>
        ))}
      </ul>
    </Box>
  )
}
