import { zodResolver } from '@hookform/resolvers/zod'
import { Button, NumberInput, Select, Stack } from '@mantine/core'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { InputSkeleton } from 'src/components/InputSkeleton'
import { Query } from 'src/components/Query'
import { TimePicker } from 'src/components/TimePicker'
import { RecurringEventResolvedBeforeSavingSchema } from 'src/db/schemas/RecurringEventSchema'
import { NutritionPer100Grams } from 'src/db/schemas/common'
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
import classes from './RecurringEventForm.module.css'

const RecurringEventFormSchema = RecurringEventResolvedBeforeSavingSchema
export type RecurringEventFormFields = z.infer<typeof RecurringEventFormSchema>

type Props = {
  initialData?: RecurringEventFormFields
  onSubmit: (data: RecurringEventFormFields) => void
  onChange?: (data: NutritionPer100Grams) => void
}

export function RecurringEventForm({
  initialData,
  onSubmit: inputOnSubmit,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const recipesResult = useGetAllRecipes()

  const {
    control,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<RecurringEventFormFields>({
    defaultValues: {
      weekday: initialData?.weekday ?? 1,
      time: initialData?.time ?? { hour: 0, minute: 0 },
      recipeToEatId: initialData?.recipeToEatId ?? '',
      percentageToEat: initialData?.percentageToEat ?? 100,
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
              maw={400}
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

        <Query
          result={recipesResult}
          whenLoading={<InputSkeleton label="Recipe to eat" maw={400} />}
        >
          {(recipes) => (
            <Controller
              name="recipeToEatId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Recipe to eat"
                  placeholder="Select recipe"
                  error={errors.recipeToEatId?.message}
                  disabled={isSubmitting}
                  maw={400}
                  data={recipes.map((r) => ({ value: r.id, label: r.name }))}
                />
              )}
            />
          )}
        </Query>

        <Controller
          name="percentageToEat"
          control={control}
          render={({ field }) => (
            <NumberInput
              {...field}
              className={classes.percentageInput}
              max={100}
              label="How much of the recipe to eat? (%)"
              placeholder="50 (%)"
              description="When making a large batch of food, you can split it into multiple meals. For example if the recipe makes 4 meals, you can set this to 25% to eat 1 meal."
              allowNegative={false}
              error={errors.percentageToEat?.message}
              disabled={isSubmitting}
              maw={200}
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
