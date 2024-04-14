import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CtxAsync, useDB } from '@vlcn.io/react'
import { DATABASE_NAME } from 'src/constants'
import { Item, Recipe, RecipeItem } from 'src/db/entities'
import { resolver } from 'src/db/resolvers/resolver'
import { RecipeResolvedBeforeSaving } from 'src/db/schemas/RecipeSchema'
import { useDataLoaders } from 'src/hooks/useDataLoaders'

/**
 * Cache key prefix to use for all SQL related queries.
 */
const SQL_QUERY_CACHE_KEY = 'sqlQuery'

function getCacheKey(ctx: CtxAsync, key: string): string[] {
  return [SQL_QUERY_CACHE_KEY, key, ctx.db.siteid]
}

function getCacheKeyToInvalidate(key: string): string[] {
  return [SQL_QUERY_CACHE_KEY, key]
}

function withQueryErrorHandling<T extends (...args: any[]) => Promise<any>>(
  name: string,
  queryFn: T
): T {
  const wrapped = async (...args: any[]) => {
    try {
      return await queryFn(...args)
    } catch (err) {
      console.error(`Error executing query '${name}':`, err)
      throw err
    }
  }
  return wrapped as T
}

export function useGetAllRecipes() {
  const ctx = useDB(DATABASE_NAME)
  const loaders = useDataLoaders()

  const name = 'getAllRecipes'
  return useQuery({
    queryKey: getCacheKey(ctx, name),
    queryFn: withQueryErrorHandling(name, async () => {
      const recipeRows = await Recipe.findMany({ connection: ctx.db })
      const recipes = await Promise.all(
        recipeRows.map((row) => resolver({ row, connection: ctx.db, loaders }))
      )
      return recipes
    }),
  })
}

export function useCreateRecipe() {
  const ctx = useDB(DATABASE_NAME)
  const queryClient = useQueryClient()

  return {
    createRecipe: async (recipe: RecipeResolvedBeforeSaving) => {
      await createRecipe(ctx, recipe)
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate('getAllRecipes'),
      })
    },
  }
}

async function createRecipe(ctx: CtxAsync, recipe: RecipeResolvedBeforeSaving) {
  const { items: itemsToUpsert, ...baseRecipe } = recipe

  await ctx.db.tx(async (tx) => {
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
  })
}
