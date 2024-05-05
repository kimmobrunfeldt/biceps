import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Select, Stack } from '@mantine/core'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { InputSkeleton } from 'src/components/InputSkeleton'
import { Query } from 'src/components/Query'
import { TimePicker } from 'src/components/TimePicker'
import { RecurringEventResolvedBeforeSavingSchema } from 'src/db/schemas/RecurringEventSchema'
import { Nutrition } from 'src/db/schemas/common'
import { useGetAllRecipes } from 'src/hooks/useDatabase'
import {
  WeekdayLongName,
  formatTime,
  getWeekdayLongNames,
  longNameToWeekdayNumber,
  parseTime,
  weekdayNumberToLongName,
} from 'src/utils/time'
import { z } from 'zod'

const RecurringEventFormSchema = RecurringEventResolvedBeforeSavingSchema
export type RecurringEventFormFields = Extract<
  z.infer<typeof RecurringEventFormSchema>,
  { eventType: 'EatRecipe' }
>

type Props = {
  selectedPersonId: string
  initialData?: RecurringEventFormFields
  onSubmit: (data: RecurringEventFormFields) => void
  onChange?: (data: Nutrition) => void
}

export function RecurringEventForm({
  selectedPersonId,
  initialData,
  onSubmit: inputOnSubmit,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const recipesResult = useGetAllRecipes()

  const commonInitialData = {
    personId: selectedPersonId,
    weekday: initialData?.weekday ?? 1,
    time: initialData?.time ?? { hour: 12, minute: 0 },
  }
  const {
    control,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<RecurringEventFormFields>({
    defaultValues: {
      ...commonInitialData,
      eventType: 'EatRecipe',
      recipeToEatId: initialData?.recipeToEatId ?? '',
      portionsToEat: initialData?.portionsToEat ?? 1,
    },

    resolver: zodResolver(RecurringEventFormSchema),
  })

  const onSubmit = useCallback(
    async (data: RecurringEventFormFields) => {
      if (isSubmitting) return

      setIsSubmitting(true)
      try {
        await inputOnSubmit({ ...data, id: initialData?.id })
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, inputOnSubmit, initialData]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="sm">
        <Controller
          name="weekday"
          control={control}
          render={({ field: { onChange, value, ...rest } }) => (
            <Select
              {...rest}
              label="Weekday"
              placeholder="Weekday"
              error={errors.weekday?.message}
              disabled={isSubmitting}
              maw={340}
              data={getWeekdayLongNames()}
              onChange={(value) =>
                onChange(
                  longNameToWeekdayNumber(
                    (value as WeekdayLongName) ?? 'Monday'
                  )
                )
              }
              value={weekdayNumberToLongName(value)}
            />
          )}
        />

        <Controller
          name="time"
          control={control}
          render={({ field: { value, onChange, ...rest } }) => (
            <TimePicker
              {...rest}
              value={formatTime({ hour: value.hour, minute: value.minute })}
              onChange={(e) => {
                onChange(parseTime(e.target.value))
              }}
              label="Time of day"
              error={errors.time?.message}
              disabled={isSubmitting}
              maw={200}
            />
          )}
        />

        <Controller
          name="recipeToEatId"
          control={control}
          render={({ field }) => (
            <Query
              result={recipesResult}
              whenEmpty={() => (
                <Select
                  {...field}
                  label="Recipe to eat"
                  placeholder="Select recipe"
                  error={errors.recipeToEatId?.message}
                  disabled={isSubmitting}
                  maw={340}
                  data={[]}
                />
              )}
              whenLoading={<InputSkeleton label="Recipe to eat" maw={340} />}
            >
              {(recipes) => (
                <Select
                  {...field}
                  label="Recipe to eat"
                  placeholder="Select recipe"
                  error={errors.recipeToEatId?.message}
                  disabled={isSubmitting}
                  maw={340}
                  data={recipes.map((r) => ({ value: r.id, label: r.name }))}
                />
              )}
            </Query>
          )}
        />

        <Controller
          name="portionsToEat"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <Select
              {...field}
              label="How many portions?"
              error={errors.portionsToEat?.message}
              disabled={isSubmitting}
              maw={340}
              value={convertPortionsToSelectValue(value)}
              onChange={(value) =>
                onChange(convertSelectValueToPortions(value ?? '1'))
              }
              data={[
                { value: '1/2', label: '1/2 portion' },
                { value: '1', label: '1 portion' },
                { value: '1 1/2', label: '1 1/2 portions' },
                { value: '2', label: '2 portions' },
              ]}
            />
          )}
        />
      </Stack>

      <Button
        type="submit"
        mt="lg"
        disabled={!isDirty || isSubmitting}
        loading={isSubmitting}
      >
        {initialData ? 'Save schedule' : 'Add schedule'}
      </Button>
    </form>
  )
}

const SELECTABLE_PORTIONS = [
  { value: '1/2', label: '1/2 portion', numeric: 0.5 },
  { value: '1', label: '1 portion', numeric: 1 },
  { value: '1 1/2', label: '1 1/2 portions', numeric: 1.5 },
  { value: '2', label: '2 portions', numeric: 2 },
]

function convertPortionsToSelectValue(portions: number): string {
  const found = SELECTABLE_PORTIONS.find(
    (p) => Math.abs(p.numeric - portions) < 0.005
  )
  return found?.value ?? '1'
}

function convertSelectValueToPortions(selectValue: string): number {
  const found = SELECTABLE_PORTIONS.find((p) => p.value === selectValue)
  return found?.numeric ?? 1
}
