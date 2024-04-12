import { Box, Button, Stack, Text } from '@mantine/core'
import { useDB } from '@vlcn.io/react'
import { Item, Recipe, RecipeItem } from 'src/db/entities'
import { resolver } from 'src/db/resolvers/resolver'
import { nanoid } from 'src/utils/nanoid'

export async function AddRecipePage() {
  const ctx = useDB('biteplanner')

  const recipes = await Promise.all((await Recipe.findMany({})).map(resolver))

  async function addData() {
    const { id: pirkkaTomatoId } = await Item.upsert({
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
    const { id: pirkkaPastaId } = await Item.upsert({
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

    const { id: recipeId } = await Recipe.insert({
      object: {
        id: nanoid(),
        name: 'Mun resepti',
      },
    })

    await RecipeItem.upsert({
      object: {
        recipeId,
        itemId: pirkkaTomatoId,
      },
      onConflict: ['itemId', 'recipeId'],
    })
    await RecipeItem.upsert({
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
      {recipes.map((row) => (
        <Box key={row.id}>
          <Text>{row.name}</Text>
          <Stack>
            {JSON.parse(row.items).map((item) => {
              return <Box key={item.id}>{item.name}</Box>
            })}
          </Stack>
        </Box>
      ))}
      <Button onClick={addData}>Add data</Button>
    </Box>
  )
}
