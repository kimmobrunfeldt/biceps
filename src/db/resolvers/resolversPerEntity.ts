import { CtxAsync } from '@vlcn.io/react'
import { createLoaders } from 'src/db/dataLoaders'
import { Recipe, RecipeRow } from 'src/db/schemas/RecipeSchema'

export const resolvers = {
  Recipe: recipeResolver,
}

export async function recipeResolver({
  row,
  ctx,
}: {
  row: RecipeRow
  ctx: CtxAsync
}): Promise<Recipe> {
  const loaders = createLoaders(ctx)
  const recipe = {
    ...row,
    items: await loaders.itemsByRecipeIds.load(row.id),
  }
  return recipe
}
