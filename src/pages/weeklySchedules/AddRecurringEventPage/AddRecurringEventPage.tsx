import { Flex } from '@mantine/core'
import { IconAlertCircle, IconChevronLeft } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { PageTemplate } from 'src/components/PageTemplate'
import { useUpsertRecurringEvent } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import {
  RecurringEventForm,
  RecurringEventFormFields,
} from 'src/pages/weeklySchedules/AddRecurringEventPage/components/RecurringEventForm'
import { routes } from 'src/routes'
import { weekdayNumberToLongName } from 'src/utils/time'
import { Link, useLocation } from 'wouter'

export function AddRecurringEventPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { withNotifications } = useNotifications()
  const [_location, setLocation] = useLocation()
  const { upsertRecurringEvent } = useUpsertRecurringEvent()

  const onSubmit = useCallback(
    async (data: RecurringEventFormFields) => {
      if (isSubmitting) return

      setIsSubmitting(true)
      try {
        await withNotifications({
          fn: async () => {
            await upsertRecurringEvent(data)
            setLocation(routes.weeklySchedule.index.path)
          },
          success: {
            message: `Schedule on ${weekdayNumberToLongName(data.weekday)} added`,
            color: 'green',
          },
          error: (err) => ({
            message: `Adding failed: ${err.message}`,
            color: 'red',
            autoClose: 5000,
            icon: <IconAlertCircle />,
          }),
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [withNotifications, isSubmitting, setLocation, upsertRecurringEvent]
  )

  return (
    <PageTemplate
      title="Add recurring event"
      titleRightSection={
        <Link to={routes.weeklySchedule.index.path}>
          <Flex direction="row" align="center">
            <IconChevronLeft /> Back to Weekly Schedule
          </Flex>
        </Link>
      }
    >
      <RecurringEventForm onSubmit={onSubmit} />
    </PageTemplate>
  )
}