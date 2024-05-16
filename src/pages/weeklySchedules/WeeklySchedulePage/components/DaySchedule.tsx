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
import { IconCopy, IconPlus, IconX } from '@tabler/icons-react'
import _ from 'lodash'
import pluralize from 'pluralize'
import { useCallback } from 'react'
import { GrayText } from 'src/components/GrayText'
import { Link } from 'src/components/Link'
import { NutritionCircle } from 'src/components/NutritionCircle'
import { PAGE_DESCRIPTION_MAX_WIDTH } from 'src/constants'
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
  editable?: boolean
  onAddRecurringEventClick?: () => void
}

export function DaySchedule({
  weekday,
  recurringEvents,
  onAddRecurringEventClick,
  editable = false,
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
        maw={PAGE_DESCRIPTION_MAX_WIDTH}
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

      <Flex
        align="center"
        justify="space-between"
        gap={{ base: 'xs', lg: 'sm' }}
        mb="md"
        maw={PAGE_DESCRIPTION_MAX_WIDTH}
      >
        {!hideNutritionHeader ? (
          <GrayText style={{ position: 'relative', top: '2px' }}>
            {formatKcal(nutritionsPerDay.kcal)} kcal,{' '}
            {formatGrams(nutritionsPerDay.protein)}g protein
          </GrayText>
        ) : null}
      </Flex>

      <Stack gap="xs">
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
              opacity={shouldFade ? 0.4 : 1}
            >
              <Text c="gray" fw="bold" miw={60}>
                {formattedTime}
              </Text>
              <Stack gap={4}>
                {recurringEvents.map((event, i) => {
                  return <EventRow key={i} event={event} editable={editable} />
                })}
              </Stack>
            </Flex>
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
