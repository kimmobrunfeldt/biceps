import { Box, Flex, Stack, Text, Title } from '@mantine/core'
import _ from 'lodash'
import pluralize from 'pluralize'
import { GrayText } from 'src/components/GrayText'
import { Link } from 'src/components/Link'
import { NutritionCircle } from 'src/components/NutritionCircle'
import {
  RecurringEventResolved,
  RecurringEventRow,
} from 'src/db/schemas/RecurringEventSchema'
import { Nutrition } from 'src/db/schemas/common'
import { calculateValuesForEvent } from 'src/pages/IndexPage/IndexPage'
import { formatRoute, routes } from 'src/routes'
import { formatGrams, formatKcal, formatPortions } from 'src/utils/format'
import {
  formatTime,
  isBeforeNow,
  weekdayNumberToLongName,
} from 'src/utils/time'
import { assertUnreachable } from 'src/utils/utils'

type Props = {
  weekday: RecurringEventRow['weekday']
  recurringEvents: RecurringEventResolved[]
  fadeEventsBeforeNow?: boolean
  hideNutritionHeader?: boolean
}

export function DaySchedule({
  weekday,
  recurringEvents,
  fadeEventsBeforeNow = false,
  hideNutritionHeader = false,
}: Props) {
  const eventsGroupedByTime = _.groupBy(
    recurringEvents,
    (event) => `${event.time.hour}-${event.time.minute}`
  )
  const sortedTimes = _.chain(recurringEvents)
    .orderBy([(e) => e.time.hour, (e) => e.time.minute])
    .map((e) => `${e.time.hour}-${e.time.minute}`)
    .uniq()
    .value()

  const nutritionsPerDay = recurringEvents.reduce(
    (acc, event) => {
      const eventTotals = calculateValuesForEvent(event)
      return {
        kcal: acc.kcal + eventTotals.kcal,
        protein: acc.protein + eventTotals.protein,
        fatTotal: acc.fatTotal + eventTotals.fatTotal,
        fatSaturated: acc.fatSaturated + eventTotals.fatSaturated,
        carbsTotal: acc.carbsTotal + eventTotals.carbsTotal,
        carbsSugar: acc.carbsSugar + eventTotals.carbsSugar,
        salt: acc.salt + eventTotals.salt,
      }
    },
    {
      kcal: 0,
      protein: 0,
      fatTotal: 0,
      fatSaturated: 0,
      carbsTotal: 0,
      carbsSugar: 0,
      salt: 0,
    } as Nutrition
  )

  return (
    <Box>
      <Flex align="center" gap="md">
        <NutritionCircle nutrition={nutritionsPerDay} variant="icon" />

        <Title order={2} size="h3">
          {weekdayNumberToLongName(weekday)}
        </Title>
        {!hideNutritionHeader ? (
          <GrayText style={{ position: 'relative', top: '2px' }}>
            {formatKcal(nutritionsPerDay.kcal)} kcal,{' '}
            {formatGrams(nutritionsPerDay.protein)}g protein
          </GrayText>
        ) : null}
      </Flex>

      <Stack pb="xl" pl={54} gap="xs">
        {recurringEvents.length === 0 && <GrayText>No events</GrayText>}
        {sortedTimes.map((timeKey, i) => {
          const recurringEvents = eventsGroupedByTime[timeKey]
          const first = recurringEvents[0] // This should always exist
          const shouldFade = fadeEventsBeforeNow && isBeforeNow(first.time)
          const formattedTime = formatTime(first.time)
          return (
            <Flex
              key={i}
              align="flex-start"
              gap={6}
              opacity={shouldFade ? 0.7 : 1}
            >
              <Text c="gray" fw="bold" miw={60}>
                {formattedTime}
              </Text>
              <Stack gap={4}>
                {recurringEvents.map((event, i) => {
                  return <EventRow key={i} event={event} />
                })}
              </Stack>
            </Flex>
          )
        })}
      </Stack>
    </Box>
  )
}

function EventRow({ event }: { event: RecurringEventResolved }) {
  switch (event.eventType) {
    case 'EatRecipe':
      return (
        <>
          <Text>
            {formatPortions(event.portionsToEat)}{' '}
            {pluralize('portion', event.portionsToEat)} of{' '}
            <Link
              to={formatRoute(routes.recipes.edit.path, {
                id: event.recipeToEatId,
              })}
            >
              {event.recipeToEat.name}
            </Link>
          </Text>
        </>
      )
    case 'EatProduct': {
      return (
        <>
          <Text>
            {formatGrams(event.weightGramsToEat)}g of{' '}
            <Link
              to={formatRoute(routes.products.edit.path, {
                id: event.productToEatId,
              })}
            >
              {event.productToEat.name}
            </Link>
          </Text>
        </>
      )
    }

    default:
      assertUnreachable(event)
  }
}
