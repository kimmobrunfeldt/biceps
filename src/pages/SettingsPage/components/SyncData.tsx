import {
  ActionIcon,
  Blockquote,
  Box,
  CopyButton,
  Flex,
  Text,
  Title,
  Tooltip,
  rem,
} from '@mantine/core'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import QRCode from 'react-qr-code'
import { GrayText } from 'src/components/GrayText'
import { APP_BASE_URL, SYNC_QUERY_PARAM } from 'src/constants'
import { useSqlite } from 'src/hooks/useSqlite'
import Peers from 'src/pages/SettingsPage/components/Peers'

export function SyncData() {
  const ctx = useSqlite()
  const syncUrl = `${APP_BASE_URL}?${SYNC_QUERY_PARAM}=${ctx.siteid}`

  return (
    <Box>
      <Blockquote p="md" color="yellow" mb="sm" maw={650}>
        Syncing data between another device might overwrite your current data.
        The most recently updated information will be used in case both devices
        have edited the same fields.
      </Blockquote>

      <Text maw={650}>
        Open the following link in another device to sync data between devices
        (peer-to-peer). Anyone with the link can start syncing. Remember to keep
        this browser open. Refreshing the page in both browsers might help
        initiating the connection.
      </Text>

      <Box pt="xs">
        <GrayText>{syncUrl}</GrayText>
      </Box>

      <CopyButton value={syncUrl} timeout={2000}>
        {({ copied, copy }) => (
          <Flex
            align="center"
            gap={2}
            onClick={copy}
            style={{ cursor: 'pointer' }}
          >
            <Text c="blue">Copy link</Text>
            <Tooltip
              label={copied ? 'Copied' : 'Copy'}
              withArrow
              position="right"
            >
              <ActionIcon
                color={copied ? 'teal' : 'blue'}
                variant="subtle"
                size="lg"
              >
                {copied ? (
                  <IconCheck style={{ width: rem(16) }} />
                ) : (
                  <IconCopy style={{ width: rem(16) }} />
                )}{' '}
              </ActionIcon>
            </Tooltip>
          </Flex>
        )}
      </CopyButton>

      <Box
        bg="white"
        p={4}
        mt="md"
        w={128}
        h={128}
        style={{ overflow: 'hidden', borderRadius: '4px' }}
      >
        <QRCode value={syncUrl} size={120} />
      </Box>

      <Box pt="lg">
        <Title order={3} fz="md" mb="xs">
          Connections
        </Title>
        <Peers />
      </Box>
    </Box>
  )
}
