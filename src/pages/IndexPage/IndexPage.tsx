import { Temporal } from '@js-temporal/polyfill'
import { Stack } from '@mantine/core'
import { useInterval } from '@mantine/hooks'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { GrayText } from 'src/components/GrayText'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import { TableSkeleton } from 'src/components/TableSkeleton'
import { RecurringEventResolved } from 'src/db/schemas/RecurringEventSchema'
import { useGetAllRecurringEvents, useGetAppState } from 'src/hooks/useDatabase'
import { DailyStats } from 'src/pages/IndexPage/components/DailyStats'
import { Introduction } from 'src/pages/IndexPage/components/Introduction'
import { calculateTotals } from 'src/pages/recipes/AddRecipePage/components/RecipeItemsTable'
import { DaySchedule } from 'src/pages/weeklySchedules/WeeklySchedulePage/components/DaySchedule'
import { Weekday, calendar, isBeforeNow } from 'src/utils/time'

export function IndexPage() {
  const appStateResult = useGetAppState()
  const recurringEventsResult = useGetAllRecurringEvents()
  const [today, setToday] = useState(Temporal.Now.plainDate(calendar))
  const interval = useInterval(() => {
    setToday(Temporal.Now.plainDate(calendar))
  }, 1000 * 60)
  useEffect(() => {
    interval.start()
    return interval.stop
  }, [interval])
  const dayOfWeek = today.dayOfWeek as Weekday

  function getTitle() {
    if (appStateResult.isLoading) return ''
    if (appStateResult.data?.onboardingState !== 'Completed') return `Welcome`
    return 'Today'
  }

  return (
    <PageTemplate title={getTitle()}>
      <Query result={appStateResult}>
        {(appState) => {
          if (appState.onboardingState !== 'Completed') return <Introduction />

          return (
            <Query
              result={recurringEventsResult}
              whenEmpty={() => (
                <GrayText>No recurring events scheduled</GrayText>
              )}
              whenLoading={<TableSkeleton />}
            >
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
                    <DailyStats
                      dayConsumed={dayConsumed}
                      dayTotals={dayTotals}
                    />
                    <DaySchedule
                      weekday={dayOfWeek}
                      recurringEvents={eventsToday}
                      hideNutritionHeader
                      fadeEventsBeforeNow
                      showCurrentTime
                    />
                  </Stack>
                )
              }}
            </Query>
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
    case 'EatRecipe': {
      const singlePortion = calculateTotals(event.recipeToEat.recipeItems, {
        amountsPerPortion: true,
        portions: event.recipeToEat.portions,
      })
      return _.mapValues(singlePortion, (val) => val * event.portionsToEat)
    }
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
