import { Temporal } from '@js-temporal/polyfill'
import { Stack } from '@mantine/core'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import { RecurringEventResolved } from 'src/db/schemas/RecurringEventSchema'
import { useGetAllRecurringEvents } from 'src/hooks/useDatabase'
import { DailyStats } from 'src/pages/IndexPage/components/DailyStats'
import { calculateTotals } from 'src/pages/recipes/AddRecipePage/components/RecipeItemsTable'
import { DaySchedule } from 'src/pages/weeklySchedules/WeeklySchedulePage/components/DaySchedule'
import { Weekday, calendar, isBeforeNow } from 'src/utils/time'

export function IndexPage() {
  const recurringEventsResult = useGetAllRecurringEvents()
  const today = Temporal.Now.plainDate(calendar)
  const dayOfWeek = today.dayOfWeek as Weekday

  return (
    <PageTemplate title="Today">
      <Query result={recurringEventsResult}>
        {(data) => {
          const eventsToday = data.filter((event) => {
            return event.weekday === dayOfWeek
          })
          const eventsBeforeNow = eventsToday.filter((event) => {
            return isBeforeNow(event.time)
          })
          const dayConsumed = calculateEventTotals(eventsBeforeNow)
          const dayTotals = calculateEventTotals(eventsToday)

          return (
            <Stack gap="xl">
              <DailyStats dayConsumed={dayConsumed} dayTotals={dayTotals} />
              <DaySchedule
                weekday={dayOfWeek}
                recurringEvents={eventsToday}
                hideNutritionHeader
              />
            </Stack>
          )
        }}
      </Query>
    </PageTemplate>
  )
}

function calculateEventTotals(recurringEvents: RecurringEventResolved[]) {
  return recurringEvents.reduce(
    (acc, event) => {
      const values = calculateValuesForEvent(event)
      return {
        weightGrams: acc.weightGrams + values.weightGrams,
        kcal: acc.kcal + values.kcal,
        protein: acc.protein + values.protein,
        fatTotal: acc.fatTotal + values.fatTotal,
        fatSaturated: acc.fatSaturated + values.fatSaturated,
        carbsTotal: acc.carbsTotal + values.carbsTotal,
        carbsSugar: acc.carbsSugar + values.carbsSugar,
        salt: acc.salt + values.salt,
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
    }
  )
}

export function calculateValuesForEvent(event: RecurringEventResolved) {
  switch (event.eventType) {
    case 'EatRecipe':
      return calculateTotals(event.recipeToEat.recipeItems, {
        amountsPerPortion: false,
        portions: event.portionsToEat,
      })
    case 'EatProduct': {
      return {
        weightGrams: event.weightGramsToEat,
        kcal: event.productToEat.kcal * event.weightGramsToEat,
        protein: event.productToEat.protein * event.weightGramsToEat,
        fatTotal: event.productToEat.fatTotal * event.weightGramsToEat,
        fatSaturated: event.productToEat.fatSaturated * event.weightGramsToEat,
        carbsTotal: event.productToEat.carbsTotal * event.weightGramsToEat,
        carbsSugar: event.productToEat.carbsSugar * event.weightGramsToEat,
        salt: event.productToEat.salt * event.weightGramsToEat,
      }
    }
  }
}
