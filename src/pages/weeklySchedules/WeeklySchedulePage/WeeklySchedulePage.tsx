import { Box, Button, Flex } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { Link } from 'src/components/Link'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import { TableSkeleton } from 'src/components/TableSkeleton'
import { useGetAllRecurringEvents } from 'src/hooks/useDatabase'
import { DaySchedule } from 'src/pages/weeklySchedules/WeeklySchedulePage/components/DaySchedule'
import { routes } from 'src/routes'
import { getWeekdays } from 'src/utils/time'

export function WeeklySchedulePage() {
  const recurringEventsResult = useGetAllRecurringEvents()
  const weekdays = getWeekdays()
  const [editMode, setEditMode] = useState(false)

  return (
    <PageTemplate
      title="Weekly Schedule"
      description="Here's your weekly meal schedule. Planning all meals beforehand makes it easier to hit your nutrition goals."
      titleRightSection={
        <Flex align="flex-end" direction="column" gap="md" miw={125}>
          <Link to={routes.weeklySchedule.add.path}>
            <Button leftSection={<IconPlus size={14} />}>Add meal</Button>
          </Link>
          <Button variant="default" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Done' : 'Edit schedule'}
          </Button>
        </Flex>
      }
    >
      <Query
        result={recurringEventsResult}
        whenLoading={<TableSkeleton />}
        whenEmpty={() => (
          <Box>
            {weekdays.map((weekday) => {
              return (
                <DaySchedule
                  key={weekday}
                  weekday={weekday}
                  recurringEvents={[]}
                  editable={editMode}
                />
              )
            })}
          </Box>
        )}
      >
        {(recurringEvents) => {
          const recurringEventsByWeekday = weekdays.map((weekday) => {
            return recurringEvents.filter((e) => e.weekday === weekday)
          })

          return (
            <Box>
              {weekdays.map((weekday, index) => {
                return (
                  <DaySchedule
                    key={weekday}
                    weekday={weekday}
                    recurringEvents={recurringEventsByWeekday[index]}
                    editable={editMode}
                  />
                )
              })}
            </Box>
          )
        }}
      </Query>
    </PageTemplate>
  )
}
