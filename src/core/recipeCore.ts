import { TXAsync } from '@vlcn.io/xplat-api'
import { Item, Recipe, RecipeItem } from 'src/db/entities'
import { withTransaction as transaction } from 'src/db/interface/databaseMethods'
import { RecipeResolvedBeforeSaving } from 'src/db/schemas/RecipeSchema'

export async function upsertRecipe(
  connection: TXAsync,
  recipe: RecipeResolvedBeforeSaving
) {
  const { items: itemsToUpsert, ...baseRecipe } = recipe

  return await transaction(connection, async (tx) => {
    const { id: recipeId } = await Recipe.clientUpsert({
      connection: tx,
      onConflict: ['name'],
      object: baseRecipe,
    })
    const items = await Promise.all(
      itemsToUpsert.map((item) =>
        Item.clientUpsert({
          connection: tx,
          object: item,
          onConflict: ['name'],
        })
      )
    )
    // Link items to receipe
    await Promise.all(
      items.map((item) =>
        RecipeItem.clientUpsert({
          connection: tx,
          object: { recipeId, itemId: item.id },
          onConflict: ['itemId', 'recipeId'],
        })
      )
    )

    return { recipeId }
  })
}
