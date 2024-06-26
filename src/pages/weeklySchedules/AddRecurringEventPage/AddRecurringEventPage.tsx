import { Flex } from '@mantine/core'
import { IconAlertCircle, IconChevronLeft } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { Link } from 'src/components/Link'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import { NBSP } from 'src/constants'
import { useGetAppState, useUpsertRecurringEvent } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import {
  RecurringEventForm,
  RecurringEventFormFields,
} from 'src/pages/weeklySchedules/AddRecurringEventPage/components/RecurringEventForm'
import { routes } from 'src/routes'
import { weekdayNumberToLongName } from 'src/utils/time'
import { useLocation } from 'wouter'

export function AddRecurringEventPage() {
  const appStateResult = useGetAppState()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { withNotifications } = useNotifications()
  const [_location, setLocation] = useLocation()
  const { upsertRecurringEvent } = useUpsertRecurringEvent()

  const onSubmit = useCallback(
    async (data: RecurringEventFormFields) => {
      if (!appStateResult.data) {
        return
      }
      if (isSubmitting) return

      setIsSubmitting(true)
      try {
        await withNotifications({
          fn: async () => {
            await upsertRecurringEvent({
              ...data,
              personId: appStateResult.data.selectedPersonId,
            })
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
    [
      withNotifications,
      isSubmitting,
      setLocation,
      upsertRecurringEvent,
      appStateResult.data,
    ]
  )

  return (
    <PageTemplate
      title="Add meal"
      description="Meal can be a breakfast, lunch, dinner, or a snack."
      titleRightSection={
        <Link to={routes.weeklySchedule.index.path}>
          <Flex direction="row" align="center">
            <IconChevronLeft /> Back to Weekly{NBSP}Schedule
          </Flex>
        </Link>
      }
    >
      <Query result={appStateResult}>
        {(appState) => (
          <RecurringEventForm
            selectedPersonId={appState.selectedPersonId}
            onSubmit={onSubmit}
          />
        )}
      </Query>
    </PageTemplate>
  )
}
