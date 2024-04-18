import { Box, Button, Stack, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import { useGetAllRecipes } from 'src/hooks/useDatabase'
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
          {(recipes) =>
            recipes.map((recipe) => (
              <Box key={recipe.id}>
                <Text>{recipe.name}</Text>
                <Stack>
                  {recipe.recipeItems.map((recipeItem) => {
                    return (
                      <Box key={recipeItem.item.id}>
                        {recipeItem.weightGrams}g {recipeItem.item.name}
                      </Box>
                    )
                  })}
                </Stack>
              </Box>
            ))
          }
        </Query>
      </Box>
    </PageTemplate>
  )
}
