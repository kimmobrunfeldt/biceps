import { Temporal } from '@js-temporal/polyfill'
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
import { useInterval } from '@mantine/hooks'
import { IconCopy, IconPlus, IconX } from '@tabler/icons-react'
import _ from 'lodash'
import pluralize from 'pluralize'
import { useCallback, useState } from 'react'
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
  calendar,
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
  editable?: boolean
  onAddRecurringEventClick?: () => void
  showCurrentTime?: boolean
}

export function DaySchedule({
  weekday,
  recurringEvents,
  onAddRecurringEventClick,
  editable = false,
  fadeEventsBeforeNow = false,
  hideNutritionHeader = false,
  showCurrentTime = false,
}: Props) {
  const [now, setNow] = useState(Temporal.Now.plainDateTime(calendar))

  useInterval(() => {
    setNow(Temporal.Now.plainDateTime(calendar))
  }, 1000 * 60)

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
        weightGrams: eventTotals.weightGrams + acc.weightGrams,
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
      weightGrams: 0,
      kcal: 0,
      protein: 0,
      fatTotal: 0,
      fatSaturated: 0,
      carbsTotal: 0,
      carbsSugar: 0,
      salt: 0,
    } as Nutrition & { weightGrams: number }
  )

  return (
    <Box pl={4}>
      <Flex
        align="center"
        justify="space-between"
        gap={{ base: 'xs', lg: 'sm' }}
        mb={8}
      >
        <Flex align="center" gap={{ base: 'xs', lg: 'sm' }}>
          <Title order={2} size="h3">
            {weekdayNumberToLongName(weekday)}
          </Title>
          {editable ? null : (
            <Box pos="relative" top={2}>
              <NutritionCircle
                nutrition={nutritionsPerDay}
                weightGrams={nutritionsPerDay.weightGrams}
                variant="icon"
              />
            </Box>
          )}

          {editable ? (
            <Flex align="flex-end" pos="relative" top={-1} gap="xs">
              <CopyScheduleButton weekday={weekday} />
              <ActionIcon
                radius="lg"
                aria-label="Add meal"
                onClick={onAddRecurringEventClick}
              >
                <IconPlus size={14} />
              </ActionIcon>
            </Flex>
          ) : null}
        </Flex>
      </Flex>

      {recurringEvents.length > 0 && !hideNutritionHeader ? (
        <Flex
          align="center"
          justify="space-between"
          gap={{ base: 'xs', lg: 'sm' }}
          mb="md"
        >
          <GrayText style={{ position: 'relative', top: '2px' }}>
            {formatKcal(nutritionsPerDay.kcal)} kcal,{' '}
            {formatGrams(nutritionsPerDay.protein)}g protein
          </GrayText>
        </Flex>
      ) : null}

      <Stack gap="xs">
        {recurringEvents.length === 0 && <GrayText>No events</GrayText>}
        {sortedTimes.map((timeKey, i) => {
          const recurringEvents = eventsGroupedByTime[timeKey]
          const first = recurringEvents[0] // This should always exist
          const shouldFade = fadeEventsBeforeNow && isBeforeNow(first.time)
          const formattedTime = formatTime(first.time)
          const prevTimeKey = i > 0 ? sortedTimes[i - 1] : null
          const prevEvents = prevTimeKey
            ? eventsGroupedByTime[prevTimeKey]
            : null
          const prevTime = prevEvents ? prevEvents[0].time : null
          const isNowGap =
            // If first event is in the future, show now gap
            (i === 0 && !isBeforeNow(first.time)) ||
            // Otherwise check if the prev event is in past end next event in future
            (i > 0 &&
              prevTime &&
              isBeforeNow(prevTime) &&
              !isBeforeNow(first.time))
          const shouldShowNow = showCurrentTime && isNowGap

          return (
            <Box key={i}>
              {shouldShowNow ? (
                <Flex align="center" gap={6} maw={200}>
                  <Text c="gray" fw="bold" miw={60}>
                    {formatTime(now)}
                  </Text>
                  <Box
                    my="lg"
                    style={{
                      height: '1px',
                      background: '#ddd',
                      flex: 1,
                    }}
                  />
                  <GrayText fw="bold" fz="xs" style={{ letterSpacing: '1px' }}>
                    NOW
                  </GrayText>
                  <Box
                    my="lg"
                    style={{
                      height: '1px',
                      background: '#ddd',
                      flex: 1,
                    }}
                  />
                </Flex>
              ) : null}

              <Flex align="flex-start" gap={6} opacity={shouldFade ? 0.4 : 1}>
                <Text c="gray" fw="bold" miw={60}>
                  {formattedTime}
                </Text>
                <Stack gap={4}>
                  {recurringEvents.map((event, i) => {
                    return (
                      <EventRow key={i} event={event} editable={editable} />
                    )
                  })}
                </Stack>
              </Flex>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

function EventRow({
  event,
  editable = false,
}: {
  event: RecurringEventResolved
  editable?: boolean
}) {
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
            {editable ? (
              <Box component="span" c="blue">
                {event.recipeToEat.name}{' '}
              </Box>
            ) : (
              <Link
                to={formatRoute(routes.recipes.edit.path, {
                  id: event.recipeToEatId,
                })}
              >
                {event.recipeToEat.name}
              </Link>
            )}
          </Text>
          {editable ? (
            <Tooltip label="Remove meal" position="right">
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
          ) : null}
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
          message: `Copied ${results.length} meals`,
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
        <Tooltip label="Copy meals to another day">
          <ActionIcon radius="lg" aria-label="Copy meals to another day">
            <IconCopy size={14} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Copy meals to</Menu.Label>
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
