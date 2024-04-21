import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Code, TextInput } from '@mantine/core'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { RecipeItemResolvedBeforeSavingSchema } from 'src/db/schemas/RecipeItemSchema'
import { RecipeResolvedBeforeSavingSchema } from 'src/db/schemas/RecipeSchema'
import { RecipeItemsForm } from 'src/pages/recipes/AddRecipePage/components/RecipeItemsForm'
import { z } from 'zod'

const RecipeFormSchema = z.object({
  id: RecipeResolvedBeforeSavingSchema.shape.id,
  name: RecipeResolvedBeforeSavingSchema.shape.name,
  recipeItems: z.array(
    RecipeItemResolvedBeforeSavingSchema.merge(
      z.object({
        __reactHookFormId: z.string().optional(),
      })
    )
  ),
})
export type RecipeFormFields = z.infer<typeof RecipeFormSchema>

type Props = {
  initialData?: RecipeFormFields
  onSubmit: (data: RecipeFormFields) => void
}

export function RecipeForm({ initialData, onSubmit: inputOnSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty, errors },
  } = useForm<RecipeFormFields>({
    defaultValues: {
      name: initialData?.name ?? '',
      recipeItems: initialData?.recipeItems ?? [],
    },
    resolver: zodResolver(RecipeFormSchema),
  })

  console.log('values', getValues())

  const onSubmit = useCallback(
    async (data: RecipeFormFields) => {
      if (isSubmitting) return

      setIsSubmitting(true)
      try {
        const recipeItems = data.recipeItems.map((recipeItem) => {
          // Remove react-hook-form's internal ID before passing to parent
          const { __reactHookFormId, ...rest } = recipeItem
          return rest
        })
        await inputOnSubmit({ ...data, recipeItems, id: initialData?.id })
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, inputOnSubmit, initialData]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextInput
            {...field}
            label="Recipe name"
            placeholder="Name"
            error={errors.name?.message}
            disabled={isSubmitting}
            maw={380}
          />
        )}
      />

      <Box py="lg">
        <RecipeItemsForm control={control} setValue={setValue} />
      </Box>

      {Object.keys(errors).length > 0 ? (
        <Box>
          <Code bg="red.0" block>
            {JSON.stringify(errors, null, 2)}
          </Code>
        </Box>
      ) : null}
      <Button
        type="submit"
        disabled={!isDirty || isSubmitting}
        loading={isSubmitting}
      >
        {initialData ? 'Save recipe' : 'Add recipe'}
      </Button>
    </form>
  )
}
