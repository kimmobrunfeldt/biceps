import { TXAsync } from '@vlcn.io/xplat-api'
import { Product, Recipe, RecipeItem } from 'src/db/entities'
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
    const products = await Promise.all(
      recipeItemsToUpsert.map((recipeItem) =>
        Product.clientUpsert({
          connection: tx,
          object: recipeItem.product,
          onConflict: ['id'],
        })
      )
    )

    // Remove existing recipe items
    await RecipeItem.remove({ where: { recipeId: recipeId }, connection: tx })
    // Link products to receipe
    await Promise.all(
      recipeItemsToUpsert.map((recipeItem, i) =>
        RecipeItem.clientUpsert({
          connection: tx,
          object: {
            recipeId,
            productId: products[i].id,
            weightGrams: recipeItem.weightGrams,
          },
          onConflict: ['productId', 'recipeId'],
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
    const products = await Promise.all(
      recipeItemsToUpsert.map((recipeItem) =>
        Product.clientUpsert({
          connection: tx,
          object: recipeItem.product,
          onConflict: ['id'],
        })
      )
    )
    // Link products to receipe
    await Promise.all(
      recipeItemsToUpsert.map((recipeItem, i) =>
        RecipeItem.insert({
          connection: tx,
          object: {
            recipeId,
            productId: products[i].id,
            weightGrams: recipeItem.weightGrams,
          },
        })
      )
    )

    return { recipeId }
  })
}
