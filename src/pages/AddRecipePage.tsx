import { Box, Button, Stack, Text } from '@mantine/core'
import { useDB, useQuery } from '@vlcn.io/react'
import { Recipe } from 'src/db/models/Recipe'
import { nanoid } from 'src/utils/nanoid'

const pirkkaTomato = nanoid(10)
const pirkkaPasta = nanoid(10)

export function AddRecipePage() {
  const ctx = useDB('biteplanner')
  const recipes = useQuery<Recipe>(
    ctx,
    `
      SELECT
        recipes.id AS id,
        recipes.name AS name,
        json_group_array(json_object('id', items.id, 'name', items.name)) AS items
      FROM recipes
      LEFT JOIN recipe_items ON recipes.id = recipe_items.recipe_id
      JOIN items ON recipe_items.item_id = items.id
      GROUP BY recipes.id, recipes.name;
      ORDER BY recipes.created_at DESC;

    `
  ).data
  console.log(recipes)

  async function addData() {
    await ctx.db.exec('INSERT INTO items (id, name) VALUES (?, ?);', [
      pirkkaTomato,
      'Pirkka Parhaat Tomato',
    ])
    await ctx.db.exec('INSERT INTO items (id, name) VALUES (?, ?);', [
      pirkkaPasta,
      'Pirkka Parhaat Pasta',
    ])
    const recipeId = nanoid(10)
    await ctx.db.exec('INSERT INTO recipes (id, name) VALUES (?, ?);', [
      recipeId,
      'Mun resepti',
    ])
    await ctx.db.exec(
      'INSERT INTO recipe_items (recipe_id, item_id) VALUES (?, ?);',
      [recipeId, pirkkaTomato]
    )
    await ctx.db.exec(
      'INSERT INTO recipe_items (recipe_id, item_id) VALUES (?, ?);',
      [recipeId, pirkkaPasta]
    )
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
