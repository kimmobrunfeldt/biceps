import { ActionIcon } from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import { IconClock } from '@tabler/icons-react'
import React, { useRef } from 'react'
import { mergeRefs } from 'src/utils/react'

type Props = React.ComponentProps<typeof TimeInput>

export const TimePicker = React.forwardRef(function TimePicker(
  props: Props,
  ref
) {
  const localRef = useRef<HTMLInputElement>(null)

  const pickerControl = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => localRef.current?.showPicker()}
    >
      <IconClock width={16} stroke={1.5} />
    </ActionIcon>
  )

  return (
    <TimeInput
      label="Use browser time picker"
      rightSection={pickerControl}
      {...props}
      ref={mergeRefs([localRef, ref])} // Don't allow overriding ref
    />
  )
})
