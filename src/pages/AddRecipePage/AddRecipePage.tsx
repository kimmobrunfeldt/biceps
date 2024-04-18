import { zodResolver } from '@hookform/resolvers/zod'
import { Button, TextInput } from '@mantine/core'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { PageTemplate } from 'src/components/PageTemplate'
import { RecipeItemResolvedBeforeSaving } from 'src/db/schemas/RecipeItemSchema'
import { RecipeResolvedSchema } from 'src/db/schemas/RecipeSchema'
import { useGetAppState, useUpsertRecipe } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import { RecipeItems } from 'src/pages/AddRecipePage/components/RecipeItems'
import { z } from 'zod'

const FormSchema = z.object({
  name: RecipeResolvedSchema.shape.name,
})
type FormData = z.infer<typeof FormSchema>

export function AddRecipePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { withNotifications } = useNotifications()
  const appStateResult = useGetAppState()
  const { upsertRecipe } = useUpsertRecipe()
  const [recipeItems, setRecipeItems] = useState<
    RecipeItemResolvedBeforeSaving[]
  >([])

  const {
    control,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<FormData>({
    defaultValues: { name: '' },
    resolver: zodResolver(FormSchema),
  })

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (isSubmitting) return

      setIsSubmitting(true)
      try {
        await withNotifications({
          fn: async () => {
            await upsertRecipe({
              ...data,
              recipeItems,
            })
          },
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [withNotifications, isSubmitting, recipeItems, upsertRecipe]
  )

  return (
    <PageTemplate title="Add recipe">
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
              disabled={appStateResult.isLoading || isSubmitting}
              maw={400}
            />
          )}
        />

        <RecipeItems
          recipeItems={recipeItems}
          onChange={(recipeItems) => setRecipeItems(recipeItems)}
        />

        <Button
          type="submit"
          mt="lg"
          disabled={!isDirty || isSubmitting || appStateResult.isLoading}
          loading={isSubmitting}
        >
          Add recipe
        </Button>
      </form>
    </PageTemplate>
  )
}
