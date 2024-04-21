import { zodResolver } from '@hookform/resolvers/zod'
import { Button, NumberInput, Stack, TextInput } from '@mantine/core'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ProductResolvedBeforeSavingSchema } from 'src/db/schemas/ProductSchema'
import {
  NutritionPer100Grams,
  isTotalCarbsGreaterOrEqualToSugars,
  isTotalFatGreaterOrEqualToSaturatedFat,
  isTotalLessOrEqualTo100Grams,
} from 'src/db/schemas/common'
import { getLabel } from 'src/utils/nutrition'
import { z } from 'zod'

const ProductFormSchema = ProductResolvedBeforeSavingSchema.superRefine(
  (values, ctx) => {
    if (!isTotalLessOrEqualTo100Grams(values)) {
      const fields = [
        'fatTotal',
        'fatSaturated',
        'carbsTotal',
        'carbsSugar',
        'protein',
        'salt',
      ] as const
      fields.forEach((field) => {
        const value = Number.isFinite(values[field]) ? values[field] : 0
        if (value > 0) {
          ctx.addIssue({
            code: 'custom',
            path: [field],
            message: 'Nutrition values per 100g add up to more than 100 grams',
          })
        }
      })
    } else if (!isTotalFatGreaterOrEqualToSaturatedFat(values)) {
      ctx.addIssue({
        code: 'custom',
        path: ['fatTotal'],
        message: `Total fat must be greater than or equal to saturated fat (${values.fatSaturated})`,
      })
    } else if (!isTotalCarbsGreaterOrEqualToSugars(values)) {
      ctx.addIssue({
        code: 'custom',
        path: ['carbsTotal'],
        message: `Total carbs must be greater than or equal to sugar (${values.carbsSugar})`,
      })
    }

    return values
  }
)

export type ProductFormFields = z.infer<typeof ProductFormSchema>

type Props = {
  initialData?: ProductFormFields
  onSubmit: (data: ProductFormFields) => void
  onChange?: (data: NutritionPer100Grams) => void
}

export function ProductForm({
  initialData,
  onSubmit: inputOnSubmit,
  onChange,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    getValues,
    formState: { isDirty, errors },
  } = useForm<ProductFormFields>({
    defaultValues: {
      name: initialData?.name ?? '',
      kcal: initialData?.kcal ?? 0,
      protein: initialData?.protein ?? 0,
      fatTotal: initialData?.fatTotal ?? 0,
      fatSaturated: initialData?.fatSaturated ?? 0,
      carbsTotal: initialData?.carbsTotal ?? 0,
      carbsSugar: initialData?.carbsSugar ?? 0,
      salt: initialData?.salt ?? 0,
    },
    resolver: zodResolver(ProductFormSchema),
  })

  const values = useWatch({ control, defaultValue: getValues() })

  useEffect(() => {
    onChange?.(getNutritionValues(values))
  }, [onChange, values])

  const onSubmit = useCallback(
    async (data: ProductFormFields) => {
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

  const keys = [
    'protein',
    'fatTotal',
    'fatSaturated',
    'carbsTotal',
    'carbsSugar',
    'salt',
  ] as const
  const gramFields = keys.map((key) => ({
    key,
    label: getLabel(key),
  })) satisfies Array<{ key: keyof ProductFormFields; label: string }>

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="sm">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Product name"
              placeholder="Name"
              error={errors.name?.message}
              disabled={isSubmitting}
              maw={400}
            />
          )}
        />

        <Controller
          name="kcal"
          control={control}
          render={({ field }) => (
            <NumberInput
              {...field}
              label="Kcal (per 100g)"
              placeholder="Kcal"
              allowNegative={false}
              decimalScale={1}
              error={errors.kcal?.message}
              disabled={isSubmitting}
              maw={200}
            />
          )}
        />

        {gramFields.map(({ key, label }) => {
          return (
            <Controller
              key={key}
              name={key}
              control={control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  label={`${label} (per 100g)`}
                  placeholder={label}
                  allowNegative={false}
                  decimalScale={3}
                  error={errors[key]?.message}
                  disabled={isSubmitting}
                  maw={200}
                />
              )}
            />
          )
        })}
      </Stack>

      <Button
        type="submit"
        mt="lg"
        disabled={!isDirty || isSubmitting}
        loading={isSubmitting}
      >
        {initialData ? 'Save product' : 'Add product'}
      </Button>
    </form>
  )
}

function getNutritionValues(nutrition: Partial<NutritionPer100Grams>) {
  return {
    kcal: nutrition.kcal || 0, // Also convert '' to 0
    fatTotal: nutrition.fatTotal || 0,
    fatSaturated: nutrition.fatSaturated || 0,
    carbsTotal: nutrition.carbsTotal || 0,
    carbsSugar: nutrition.carbsSugar || 0,
    protein: nutrition.protein || 0,
    salt: nutrition.salt || 0,
  }
}
