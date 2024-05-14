import {
  ActionIcon,
  Box,
  Flex,
  Menu,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconCopy, IconX } from '@tabler/icons-react'
import _ from 'lodash'
import pluralize from 'pluralize'
import { useCallback } from 'react'
import { GrayText } from 'src/components/GrayText'
import { Link } from 'src/components/Link'
import { NutritionCircle } from 'src/components/NutritionCircle'
import {
  RecurringEventResolved,
  RecurringEventRow,
} from 'src/db/schemas/RecurringEventSchema'
import { Nutrition } from 'src/db/schemas/common'
import {
  useCopyDaySchedule,
  useDeleteRecurringEvent,
} from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import { calculateValuesForEvent } from 'src/pages/IndexPage/IndexPage'
import { formatRoute, routes } from 'src/routes'
import { formatGrams, formatKcal, formatPortions } from 'src/utils/format'
import {
  Weekday,
  formatTime,
  getWeekdays,
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
        <Flex align="flex-end">
          <CopyScheduleButton weekday={weekday} />
        </Flex>
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
  const { deleteRecurringEvent } = useDeleteRecurringEvent()
  const { withNotifications } = useNotifications()

  const onRemove = useCallback(async () => {
    await withNotifications({
      fn: async () => {
        await deleteRecurringEvent(event.id)
      },
      minLoadingNotificationMs: 500,
      success: {
        message: `Scheduled event deleted`,
        color: 'green',
      },
      error: (err) => ({
        message: `Failed delete: ${err.message}`,
        color: 'red',
        icon: <IconX />,
      }),
    })
  }, [deleteRecurringEvent, withNotifications, event])

  switch (event.eventType) {
    case 'EatRecipe':
      return (
        <Flex align="center" gap="xs">
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
          <Tooltip label="Remove scheduled event" position="right">
            <ActionIcon
              variant="light"
              aria-label="Remove"
              radius="lg"
              size="xs"
              onClick={onRemove}
              color="red"
            >
              <IconX height="70%" />
            </ActionIcon>
          </Tooltip>
        </Flex>
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

function CopyScheduleButton({
  weekday: selectedWeekday,
}: {
  weekday: Weekday
}) {
  const { copySchedule } = useCopyDaySchedule()
  const { withNotifications } = useNotifications()

  const onClick = useCallback(
    async (weekday: Weekday) => {
      await withNotifications({
        fn: async () => {
          const results = await copySchedule(selectedWeekday, weekday)
          return results
        },
        minLoadingNotificationMs: 500,
        loading: { message: 'Copying ...' },
        success: (results) => ({
          message: `Copied ${results.length} events`,
          color: 'green',
        }),
        error: (err) => ({
          message: `Failed to copy: ${err.message}`,
          color: 'red',
          icon: <IconX />,
        }),
      })
    },
    [copySchedule, selectedWeekday, withNotifications]
  )

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Tooltip label="Copy schedule to another day">
          <ActionIcon
            size="sm"
            radius="lg"
            aria-label="Copy schedule to another day"
            pos="relative"
            top={2}
          >
            <IconCopy size={14} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Copy schedule to</Menu.Label>
        {getWeekdays().map((weekday) => {
          const disabled = weekday === selectedWeekday
          return (
            <Menu.Item
              disabled={disabled}
              key={weekday}
              onClick={disabled ? undefined : onClick.bind(null, weekday)}
            >
              {weekdayNumberToLongName(weekday)}
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}
