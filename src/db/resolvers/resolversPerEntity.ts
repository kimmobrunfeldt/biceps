import { CommonResolverOptions } from 'src/db/resolvers/types'
import { RecipeResolved, RecipeRow } from 'src/db/schemas/RecipeSchema'

export const resolvers = {
  Recipe: recipeResolver,
}

export async function recipeResolver({
  row,
  loaders,
}: {
  row: RecipeRow
} & CommonResolverOptions): Promise<RecipeResolved> {
  const recipe = {
    ...row,
    items: await loaders.itemsByRecipeIds.load(row.id),
  }
  return recipe
}
