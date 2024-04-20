import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Code, NumberInput, Stack, TextInput } from '@mantine/core'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ProductResolvedBeforeSavingSchema } from 'src/db/schemas/ProductSchema'
import { z } from 'zod'

const ProductFormSchema = ProductResolvedBeforeSavingSchema
export type ProductFormFields = z.infer<typeof ProductFormSchema>

type Props = {
  initialData?: ProductFormFields
  onSubmit: (data: ProductFormFields) => void
}

export function ProductForm({ initialData, onSubmit: inputOnSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<ProductFormFields>({
    defaultValues: {
      name: initialData?.name ?? '',
      kcal: initialData?.kcal ?? 0,
      fatTotal: initialData?.fatTotal ?? 0,
      fatSaturated: initialData?.fatSaturated ?? 0,
      carbsTotal: initialData?.carbsTotal ?? 0,
      carbsSugar: initialData?.carbsSugar ?? 0,
      protein: initialData?.protein ?? 0,
      salt: initialData?.salt ?? 0,
    },
    resolver: zodResolver(ProductFormSchema),
  })

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

  const gramFields = [
    { key: 'fatTotal', label: 'Fat' },
    { key: 'fatSaturated', label: 'Saturated fat' },
    { key: 'carbsTotal', label: 'Carbs' },
    { key: 'carbsSugar', label: 'Sugar' },
    { key: 'protein', label: 'Protein' },
    { key: 'salt', label: 'Salt' },
  ] satisfies Array<{ key: keyof ProductFormFields; label: string }>

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

      {Object.keys(errors).length > 0 ? (
        <Box>
          <Code bg="red.0" block>
            {JSON.stringify(errors, null, 2)}
          </Code>
        </Box>
      ) : null}
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
