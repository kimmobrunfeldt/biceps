import { Box, Button, Stack, Text } from '@mantine/core'
import { useCreateRecipe, useGetAllRecipes } from 'src/hooks/useDatabase'

export function AddRecipePage() {
  const { data: recipes } = useGetAllRecipes()
  const { createRecipe } = useCreateRecipe()
  console.log('getAllRecipes', recipes)

  async function onAddRecipeClick() {
    await createRecipe({
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
      <h1>Recipes</h1>
      {recipes?.map((recipe) => (
        <Box key={recipe.id}>
          <Text>{recipe.name}</Text>
          <Stack>
            {recipe.items.map((item) => {
              return <Box key={item.id}>{item.name}</Box>
            })}
          </Stack>
        </Box>
      ))}
      <Button onClick={onAddRecipeClick}>Add recipe</Button>
    </Box>
  )
}
