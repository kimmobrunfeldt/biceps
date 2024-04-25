import { Box, Flex, Stack, Text } from '@mantine/core'
import { IconNetwork, IconNetworkOff } from '@tabler/icons-react'
import { useRtc } from 'src/hooks/useSqlite.js'

export default function Peers() {
  const { established, pending } = useRtc()

  return (
    <Box>
      {pending.length === 0 && established.length === 0 && (
        <Text>No open connections</Text>
      )}

      {pending.length > 0 && (
        <Stack gap={4}>
          <Text>Pending connections</Text>
          {pending.map((pendingId) => (
            <Flex
              component="li"
              key={pendingId}
              id={pendingId}
              align="center"
              gap="xs"
              p={0}
              m={0}
            >
              <IconNetworkOff /> <Text>{pendingId}</Text>
            </Flex>
          ))}
        </Stack>
      )}

      {established.length > 0 && (
        <Stack gap={4} pt="md">
          <Text>Established connections</Text>
          {established.map((connectedId) => (
            <Flex
              component="li"
              key={connectedId}
              id={connectedId}
              align="center"
              gap="xs"
              p={0}
              m={0}
            >
              <IconNetwork /> <Text>{connectedId}</Text>
            </Flex>
          ))}
        </Stack>
      )}
    </Box>
  )
}
