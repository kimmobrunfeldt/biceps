import { Recipe, RecipeRow } from 'src/db/schemas/RecipeSchema'

export const resolvers = {
  Recipe: recipeResolver,
}

export async function recipeResolver(recipe: RecipeRow): Promise<Recipe> {
  return {
    ...recipe,
    items: [], // TODO: Implement
  }
}
