import { Text } from '@mantine/core'
import { useModals } from '@mantine/modals'
import { IconX } from '@tabler/icons-react'
import { useLayoutEffect, useState } from 'react'
import { GrayText } from 'src/components/GrayText'
import { useNotifications } from 'src/hooks/useNotification'
import { useSyncWithPeerId } from 'src/hooks/usePeerIdToConnect'
import { useSqlite } from 'src/hooks/useSqlite'

export function useSyncDataModalOpener() {
  const ctx = useSqlite()
  const { notification, withNotifications } = useNotifications()
  const modals = useModals()
  const peerId = useSyncWithPeerId()
  const [modalOpened, setModalOpened] = useState(false)

  const modalId = 'data-sync'
  useLayoutEffect(() => {
    if (peerId && !modalOpened) {
      setModalOpened(true)

      if (peerId === ctx.siteid) {
        notification({
          message: 'Cannot sync data with the same device ID!',
          color: 'red',
          icon: <IconX />,
        })
        return
      }

      modals.openConfirmModal({
        modalId,
        title: 'Sync data with another device?',
        children: (
          <>
            <Text size="sm">
              <b>
                Syncing data between another device might overwrite your current
                data.
              </b>{' '}
              Data from this device is sent to them and vice versa. The most
              recently updated information will be used in case both devices
              have edited the same fields.
            </Text>
            <Text size="sm" py="sm"></Text>
            <Text size="sm">Their device ID:</Text>
            <GrayText pb="sm" size="sm">
              {peerId}
            </GrayText>
            <Text size="sm">Your device ID:</Text>
            <GrayText pb="sm" size="sm">
              {ctx.siteid}
            </GrayText>
          </>
        ),
        labels: { confirm: 'Sync data', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        closeOnConfirm: true,

        onConfirm: async () => {
          modals.closeModal(modalId)
          await withNotifications({
            fn: async () => {
              ctx.rtc.connectTo(peerId)
            },
            success: { message: 'Data sync enabled', color: 'green' },
            error: (error) => {
              console.error(error)
              setModalOpened(false)
              return {
                message: 'Failed to start data sync!',
                color: 'red',
                icon: <IconX />,
              }
            },
          })
        },
      })
    }
  }, [
    peerId,
    modalOpened,
    modals,
    withNotifications,
    ctx.rtc,
    notification,
    ctx.siteid,
  ])
}
