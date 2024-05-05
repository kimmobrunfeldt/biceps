import { Blockquote } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { DeleteAllDataLink } from 'src/components/DeleteAllDataLink'

export function DangerZone() {
  return (
    <>
      <Blockquote
        color="red"
        icon={<IconAlertTriangle />}
        p="lg"
        maw={650}
        radius="md"
      >
        Be careful! The following actions need to be handled with care.
      </Blockquote>

      <DeleteAllDataLink />
    </>
  )
}
