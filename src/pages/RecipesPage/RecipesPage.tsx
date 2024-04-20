import { Box, Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import { useGetAllRecipes } from 'src/hooks/useDatabase'
import { RecipesTable } from 'src/pages/RecipesPage/components/RecipesTable'
import { routes } from 'src/routes'
import { Link } from 'wouter'

export function RecipesPage() {
  const recipesResult = useGetAllRecipes()

  return (
    <PageTemplate
      title="Recipes"
      titleRightSection={
        <Link to={routes.recipes.add.path}>
          <Button leftSection={<IconPlus size={14} />}>Add recipe</Button>
        </Link>
      }
    >
      <Box py="lg">
        <Query result={recipesResult}>
          {(recipes) => {
            return <RecipesTable recipes={recipes} onRemove={() => undefined} />
          }}
        </Query>
      </Box>
    </PageTemplate>
  )
}
