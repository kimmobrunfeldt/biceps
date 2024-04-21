import { Box, Flex } from '@mantine/core'
import { IconAlertCircle, IconChevronLeft } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import { useGetRecipe, useUpsertRecipe } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import {
  RecipeForm,
  RecipeFormFields,
} from 'src/pages/recipes/AddRecipePage/components/RecipeForm'
import { routes } from 'src/routes'
import { Link } from 'wouter'

type Props = {
  id: string
}
export function EditRecipePage({ id }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { withNotifications } = useNotifications()
  const { upsertRecipe } = useUpsertRecipe()
  const recipeResult = useGetRecipe(id)

  const onSubmit = useCallback(
    async (data: RecipeFormFields) => {
      if (isSubmitting) return

      setIsSubmitting(true)
      try {
        await withNotifications({
          fn: async () => {
            await upsertRecipe(data)
          },
          success: { message: `Recipe '${data.name}' saved`, color: 'green' },
          error: (err) => ({
            message: `Saving failed: ${err.message}`,
            color: 'red',
            icon: <IconAlertCircle />,
          }),
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [withNotifications, isSubmitting, upsertRecipe]
  )

  return (
    <PageTemplate
      title="Edit recipe"
      titleRightSection={
        <Link to={routes.recipes.index.path}>
          <Flex direction="row" align="center">
            <IconChevronLeft /> Back to Recipes
          </Flex>
        </Link>
      }
    >
      <Query result={recipeResult} isEmpty={() => false}>
        {(recipe) => {
          if (!recipe) {
            return <Box>Recipe not found</Box>
          }

          return <RecipeForm onSubmit={onSubmit} initialData={recipe} />
        }}
      </Query>
    </PageTemplate>
  )
}
