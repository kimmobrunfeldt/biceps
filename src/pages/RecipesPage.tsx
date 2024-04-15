import { Box, Button, Stack, Text, Title } from '@mantine/core'
import { Query } from 'src/components/Query'
import { useGetAllRecipes, useUpsertRecipe } from 'src/hooks/useDatabase'

export function RecipesPage() {
  const recipesResult = useGetAllRecipes()
  const { upsertRecipe } = useUpsertRecipe()

  async function onAddRecipeClick() {
    await upsertRecipe({
      name: 'My recipe',
      items: [
        {
          name: 'Pirkka Parhaat Tomato',
          kcal: 10,
          fatTotal: 0,
          fatSaturated: 0,
          carbsTotal: 0,
          carbsSugar: 0,
          salt: 0,
          protein: 0,
        },
        {
          name: 'Pirkka Parhaat Pasta',
          kcal: 10,
          fatTotal: 0,
          fatSaturated: 0,
          carbsTotal: 0,
          carbsSugar: 0,
          salt: 0,
          protein: 0,
        },
      ],
    })
  }

  return (
    <Box>
      <Title>Recipes</Title>
      <Box py="lg">
        <Query result={recipesResult}>
          {(recipes) =>
            recipes.map((recipe) => (
              <Box key={recipe.id}>
                <Text>{recipe.name}</Text>
                <Stack>
                  {recipe.items.map((item) => {
                    return <Box key={item.id}>{item.name}</Box>
                  })}
                </Stack>
              </Box>
            ))
          }
        </Query>
      </Box>
      <Button onClick={onAddRecipeClick}>Add recipe</Button>
    </Box>
  )
}
