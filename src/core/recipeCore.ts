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
      onConflict: ['name'],
      object: baseRecipe,
    })
    const items = await Promise.all(
      recipeItemsToUpsert.map((recipeItem) =>
        Item.clientUpsert({
          connection: tx,
          object: recipeItem.item,
          onConflict: ['name'],
        })
      )
    )
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
