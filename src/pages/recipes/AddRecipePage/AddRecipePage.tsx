import { Flex } from '@mantine/core'
import { IconAlertCircle, IconChevronLeft } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { PageTemplate } from 'src/components/PageTemplate'
import { useCreateRecipe } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import {
  RecipeForm,
  RecipeFormFields,
} from 'src/pages/recipes/AddRecipePage/components/RecipeForm'
import { routes } from 'src/routes'
import { Link, useLocation } from 'wouter'

export function AddRecipePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { withNotifications } = useNotifications()
  const { createRecipe } = useCreateRecipe()
  const [_location, setLocation] = useLocation()

  const onSubmit = useCallback(
    async (data: RecipeFormFields) => {
      if (isSubmitting) return

      setIsSubmitting(true)
      try {
        await withNotifications({
          fn: async () => {
            await createRecipe(data)
            setLocation(routes.recipes.index.path)
          },
          success: { message: `Recipe '${data.name}' added`, color: 'green' },
          error: (err) => ({
            message: `Adding failed: ${err.message}`,
            color: 'red',
            autoClose: 5000,
            icon: <IconAlertCircle />,
          }),
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [withNotifications, isSubmitting, createRecipe, setLocation]
  )

  return (
    <PageTemplate
      title="Add recipe"
      titleRightSection={
        <Link to={routes.recipes.index.path}>
          <Flex direction="row" align="center">
            <IconChevronLeft /> Back to Recipes
          </Flex>
        </Link>
      }
    >
      <RecipeForm onSubmit={onSubmit} />
    </PageTemplate>
  )
}
