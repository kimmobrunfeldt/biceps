import {
  ActionIcon,
  Box,
  CopyButton,
  Flex,
  Text,
  Title,
  Tooltip,
  rem,
} from '@mantine/core'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { APP_BASE_URL } from 'src/constants'
import { useSqlite } from 'src/hooks/useSqlite'
import Peers from 'src/pages/SettingsPage/components/Peers'
import classes from './SyncData.module.css'

export function SyncData() {
  const ctx = useSqlite()

  return (
    <Box>
      <Text c="gray">
        All data is stored locally in your browser. To sync data between
        devices, you need open the following link in another device. Remember to
        keep this browser open.
      </Text>
      <Text py={6} className={classes.description}>
        {APP_BASE_URL}?peerId={ctx.siteid}
      </Text>
      <CopyButton value={`${APP_BASE_URL}?peerId=${ctx.siteid}`} timeout={2000}>
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

      <Box pt="lg">
        <Title order={3} fz="md" mb="md">
          Connections
        </Title>
        <Peers />
      </Box>
    </Box>
  )
}
