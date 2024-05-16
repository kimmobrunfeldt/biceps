import { Box, Button, Flex, Modal, Stack } from '@mantine/core'
import { IconCheck, IconPencil } from '@tabler/icons-react'
import { useState } from 'react'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import { TableSkeleton } from 'src/components/TableSkeleton'
import { useGetAllRecurringEvents } from 'src/hooks/useDatabase'
import { AddRecurringEventModalContent } from 'src/pages/weeklySchedules/WeeklySchedulePage/components/AddRecurringEventModalContent'
import { DaySchedule } from 'src/pages/weeklySchedules/WeeklySchedulePage/components/DaySchedule'
import { Weekday, getWeekdays } from 'src/utils/time'

export function WeeklySchedulePage() {
  const recurringEventsResult = useGetAllRecurringEvents()
  const weekdays = getWeekdays()
  const [editMode, setEditMode] = useState(false)
  const [openModalWithInitialState, setOpenModalWithInitialState] =
    useState<Weekday | null>(null)

  return (
    <PageTemplate
      title="Weekly Schedule"
      description="Here's your weekly meal schedule. Planning all meals beforehand makes it easier to hit your nutrition goals."
      titleRightSection={
        <Flex align="flex-end" direction="column" gap="md" miw={125}>
          <Button
            onClick={() => setEditMode(!editMode)}
            leftSection={
              editMode ? <IconCheck size={14} /> : <IconPencil size={14} />
            }
          >
            {editMode ? 'Done' : 'Edit schedule'}
          </Button>
        </Flex>
      }
    >
      <Modal
        opened={openModalWithInitialState !== null}
        onClose={() => setOpenModalWithInitialState(null)}
        title="Add meal"
      >
        <AddRecurringEventModalContent
          initialWeekday={openModalWithInitialState!} // only open when this is not null
          onSubmitSuccess={() => setOpenModalWithInitialState(null)}
        />
      </Modal>

      <Query
        result={recurringEventsResult}
        whenLoading={<TableSkeleton />}
        isEmpty={() => false}
      >
        {(recurringEvents) => {
          const recurringEventsByWeekday = weekdays.map((weekday) => {
            return recurringEvents.filter((e) => e.weekday === weekday)
          })

          return (
            <Box>
              {weekdays.map((weekday, index) => {
                return (
                  <Stack key={weekday} gap="md" pb="xl">
                    <DaySchedule
                      weekday={weekday}
                      recurringEvents={recurringEventsByWeekday[index]}
                      editable={editMode}
                      onAddRecurringEventClick={setOpenModalWithInitialState.bind(
                        null,
                        weekday
                      )}
                    />
                  </Stack>
                )
              })}
            </Box>
          )
        }}
      </Query>
    </PageTemplate>
  )
}
