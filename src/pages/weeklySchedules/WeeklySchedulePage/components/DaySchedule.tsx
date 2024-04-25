import { Box, Flex, Text, Title } from '@mantine/core'
import pluralize from 'pluralize'
import { Link } from 'src/components/Link'
import { NutritionCircle } from 'src/components/NutritionCircle'
import {
  RecurringEventResolved,
  RecurringEventRow,
} from 'src/db/schemas/RecurringEventSchema'
import { Nutrition } from 'src/db/schemas/common'
import { calculateTotals } from 'src/pages/recipes/AddRecipePage/components/RecipeItemsTable'
import { formatRoute, routes } from 'src/routes'
import { formatGrams, formatKcal, formatPortions } from 'src/utils/format'
import { formatTime, weekdayNumberToLongName } from 'src/utils/time'

type Props = {
  weekday: RecurringEventRow['weekday']
  recurringEvents: RecurringEventResolved[]
}

export function DaySchedule({ weekday, recurringEvents }: Props) {
  const nutritionsPerDay = recurringEvents.reduce(
    (acc, event) => {
      const portionTotals = calculateTotals(event.recipeToEat.recipeItems, {
        amountsPerPortion: true,
        portions: event.portionsToEat,
      })
      return {
        kcal: acc.kcal + portionTotals.kcal,
        protein: acc.protein + portionTotals.protein,
        fatTotal: acc.fatTotal + portionTotals.fatTotal,
        fatSaturated: acc.fatSaturated + portionTotals.fatSaturated,
        carbsTotal: acc.carbsTotal + portionTotals.carbsTotal,
        carbsSugar: acc.carbsSugar + portionTotals.carbsSugar,
        salt: acc.salt + portionTotals.salt,
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
      <Flex align="center" gap="md" pb="sm">
        <NutritionCircle nutrition={nutritionsPerDay} variant="icon" />

        <Title order={2}>{weekdayNumberToLongName(weekday)}</Title>
        <Text style={{ position: 'relative', top: '2px' }}>
          {formatKcal(nutritionsPerDay.kcal)} kcal,{' '}
          {formatGrams(nutritionsPerDay.protein)}g protein
        </Text>
      </Flex>

      <Box pb="xl" pl={55}>
        {recurringEvents.length === 0 && <Text c="gray">No events</Text>}
        {recurringEvents.map((recurringEvent, i) => {
          const time = formatTime(recurringEvent.time)
          return (
            <Flex key={i} align="center" gap={6}>
              <Text c="gray" fw="bold">
                {time}
              </Text>
              <Text>
                {formatPortions(recurringEvent.portionsToEat)}{' '}
                {pluralize('portion', recurringEvent.portionsToEat)} of{' '}
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
