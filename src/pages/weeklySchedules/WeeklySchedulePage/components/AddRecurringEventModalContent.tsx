import { IconAlertCircle } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { EditRecurringEventSkeleton } from 'src/components/EditRecurringEventSkeleton'
import { Query } from 'src/components/Query'
import { useGetAppState, useUpsertRecurringEvent } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import {
  RecurringEventForm,
  RecurringEventFormFields,
} from 'src/pages/weeklySchedules/AddRecurringEventPage/components/RecurringEventForm'
import { Weekday, weekdayNumberToLongName } from 'src/utils/time'

export function AddRecurringEventModalContent({
  initialWeekday,
  onSubmitSuccess,
}: {
  initialWeekday: Weekday
  onSubmitSuccess?: () => void
}) {
  const appStateResult = useGetAppState()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { withNotifications } = useNotifications()
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
            onSubmitSuccess?.()
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
      onSubmitSuccess,
      upsertRecurringEvent,
      appStateResult.data,
    ]
  )

  return (
    <Query result={appStateResult} whenLoading={<EditRecurringEventSkeleton />}>
      {(appState) => (
        <RecurringEventForm
          selectedPersonId={appState.selectedPersonId}
          onSubmit={onSubmit}
          initialData={{ weekday: initialWeekday }}
        />
      )}
    </Query>
  )
}
