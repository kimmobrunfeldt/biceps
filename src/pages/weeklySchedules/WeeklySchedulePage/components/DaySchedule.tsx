import { Box, Flex, Text, Title } from '@mantine/core'
import {
  RecurringEventResolved,
  RecurringEventRow,
} from 'src/db/schemas/RecurringEventSchema'
import { formatRoute, routes } from 'src/routes'
import { formatTime, weekdayNumberToLongName } from 'src/utils/time'
import { Link } from 'wouter'

type Props = {
  weekday: RecurringEventRow['weekday']
  recurringEvents: RecurringEventResolved[]
}

export function DaySchedule({ weekday, recurringEvents }: Props) {
  return (
    <Box>
      <Title order={2} pb="sm">
        {weekdayNumberToLongName(weekday)}
      </Title>

      <Box pb="xl">
        {recurringEvents.length === 0 && <Text c="gray">No events</Text>}
        {recurringEvents.map((recurringEvent, i) => {
          const time = formatTime(recurringEvent.time)
          return (
            <Flex key={i} align="center" gap={14}>
              <Text c="gray">{time}</Text>
              <Text>
                {Math.round(recurringEvent.percentageToEat)}% of{' '}
                <Link
                  to={formatRoute(routes.recipes.edit.path, {
                    id: recurringEvent.recipeToEatId,
                  })}
                >
                  {recurringEvent.recipeToEat.name}
                </Link>
              </Text>
            </Flex>
          )
        })}
      </Box>
    </Box>
  )
}
