import { Box, Button, Stack, Text } from '@mantine/core'
import { useDB } from '@vlcn.io/react'
import { DATABASE_NAME } from 'src/constants'
import { Item, Recipe, RecipeItem } from 'src/db/entities'
import { useGetAllRecipes } from 'src/hooks/useData'
import { nanoid } from 'src/utils/nanoid'

export function AddRecipePage() {
  const ctx = useDB(DATABASE_NAME)
  const { data: recipes } = useGetAllRecipes()
  console.log('getAllRecipes', recipes)

  async function addData() {
    const { id: pirkkaTomatoId } = await Item.clientUpsert({
      ctx,
      object: {
        id: nanoid(),
        name: 'Pirkka Parhaat Tomato',
        kcal: 10,
        fatTotal: 0,
        fatSaturated: 0,
        carbsTotal: 0,
        carbsSugar: 0,
        salt: 0,
        protein: 0,
      },
      onConflict: ['name'],
    })
    const { id: pirkkaPastaId } = await Item.clientUpsert({
      ctx,
      object: {
        id: nanoid(),
        name: 'Pirkka Parhaat Pasta',
        kcal: 10,
        fatTotal: 0,
        fatSaturated: 0,
        carbsTotal: 0,
        carbsSugar: 0,
        salt: 0,
        protein: 0,
      },
      onConflict: ['name'],
    })

    const { id: recipeId } = await Recipe.clientUpsert({
      ctx,
      onConflict: ['name'],
      object: {
        id: nanoid(),
        name: 'Mun resepti',
      },
    })

    await RecipeItem.clientUpsert({
      ctx,
      object: {
        recipeId,
        itemId: pirkkaTomatoId,
      },
      onConflict: ['itemId', 'recipeId'],
    })
    await RecipeItem.clientUpsert({
      ctx,
      object: {
        recipeId,
        itemId: pirkkaPastaId,
      },
      onConflict: ['itemId', 'recipeId'],
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
      <Button onClick={addData}>Add data</Button>
    </Box>
  )
}
