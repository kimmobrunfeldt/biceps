import { Box, Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { Link } from 'src/components/Link'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import { useGetAllRecurringEvents } from 'src/hooks/useDatabase'
import { DaySchedule } from 'src/pages/weeklySchedules/WeeklySchedulePage/components/DaySchedule'
import { routes } from 'src/routes'
import { getWeekdays } from 'src/utils/time'

export function WeeklySchedulePage() {
  const recurringEventsResult = useGetAllRecurringEvents()
  const weekdays = getWeekdays()

  return (
    <PageTemplate
      title="Weekly Schedule"
      description="Here's your weekly meal schedule. Planning all meals beforehand makes it easier to hit your nutrition goals."
      titleRightSection={
        <Link to={routes.weeklySchedule.add.path}>
          <Button leftSection={<IconPlus size={14} />}>Add meal</Button>
        </Link>
      }
    >
      <Query
        result={recurringEventsResult}
        whenEmpty={() => (
          <Box>
            {weekdays.map((weekday) => {
              return (
                <DaySchedule
                  key={weekday}
                  weekday={weekday}
                  recurringEvents={[]}
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
