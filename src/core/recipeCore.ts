import { TXAsync } from '@vlcn.io/xplat-api'
import { Item, Recipe, RecipeItem } from 'src/db/entities'
import { withTransaction as transaction } from 'src/db/interface/databaseMethods'
import { RecipeResolvedBeforeSaving } from 'src/db/schemas/RecipeSchema'

export async function upsertRecipe(
  connection: TXAsync,
  recipe: RecipeResolvedBeforeSaving
) {
  const { recipeItems: recipeItemsToUpsert, ...baseRecipe } = recipe

  return await transaction(connection, async (tx) => {
    const { id: recipeId } = await Recipe.clientUpsert({
      connection: tx,
      onConflict: ['id'],
      object: baseRecipe,
    })
    const items = await Promise.all(
      recipeItemsToUpsert.map((recipeItem) =>
        Item.clientUpsert({
          connection: tx,
          object: recipeItem.item,
          onConflict: ['id'],
        })
      )
    )

    // Remove existing recipe items
    await RecipeItem.remove({ where: { recipeId: recipeId }, connection: tx })
    // Link items to receipe
    await Promise.all(
      recipeItemsToUpsert.map((recipeItem, i) =>
        RecipeItem.clientUpsert({
          connection: tx,
          object: {
            recipeId,
            itemId: items[i].id,
            weightGrams: recipeItem.weightGrams,
          },
          onConflict: ['itemId', 'recipeId'],
        })
      )
    )

    return { recipeId }
  })
}

export async function createRecipe(
  connection: TXAsync,
  recipe: RecipeResolvedBeforeSaving
) {
  const { recipeItems: recipeItemsToUpsert, ...baseRecipe } = recipe

  return await transaction(connection, async (tx) => {
    const { id: recipeId } = await Recipe.insert({
      connection: tx,
      object: baseRecipe,
    })
    const items = await Promise.all(
      recipeItemsToUpsert.map((recipeItem) =>
        Item.clientUpsert({
          connection: tx,
          object: recipeItem.item,
          onConflict: ['id'],
        })
      )
    )
    // Link items to receipe
    await Promise.all(
      recipeItemsToUpsert.map((recipeItem, i) =>
        RecipeItem.insert({
          connection: tx,
          object: {
            recipeId,
            itemId: items[i].id,
            weightGrams: recipeItem.weightGrams,
          },
        })
      )
    )

    return { recipeId }
  })
}
