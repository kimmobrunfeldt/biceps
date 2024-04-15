import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CtxAsync, useDB } from '@vlcn.io/react'
import { APP_STATE_KEY, DATABASE_NAME } from 'src/constants'
import { deleteAllData } from 'src/core/dataCore'
import { upsertRecipe } from 'src/core/recipeCore'
import { AppState, Person, Recipe } from 'src/db/entities'
import { resolver } from 'src/db/resolvers/resolver'
import { PersonBeforeDatabase } from 'src/db/schemas/PersonSchema'
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

export function useUpsertRecipe() {
  const ctx = useDB(DATABASE_NAME)
  const queryClient = useQueryClient()

  return {
    upsertRecipe: async (recipe: RecipeResolvedBeforeSaving) => {
      await upsertRecipe(ctx.db, recipe)
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate('getAllRecipes'),
      })
    },
  }
}

export function useDeleteAllData() {
  const ctx = useDB(DATABASE_NAME)
  const queryClient = useQueryClient()

  return {
    deleteAllData: async () => {
      await deleteAllData(ctx.db)
      queryClient.invalidateQueries()
    },
  }
}

export function useGetAppState() {
  const ctx = useDB(DATABASE_NAME)
  const loaders = useDataLoaders()

  const name = 'getAppState'
  return useQuery({
    queryKey: getCacheKey(ctx, name),
    queryFn: withQueryErrorHandling(name, async () => {
      const appState = await AppState.find({
        connection: ctx.db,
        where: { key: APP_STATE_KEY },
      })
      return await resolver({ row: appState, connection: ctx.db, loaders })
    }),
  })
}

export function useUpdatePerson() {
  const ctx = useDB(DATABASE_NAME)
  const queryClient = useQueryClient()

  return {
    updatePerson: async (
      personId: string,
      newValues: Partial<PersonBeforeDatabase>
    ) => {
      await Person.update({
        connection: ctx.db,
        where: { id: personId },
        set: newValues,
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate('getAppState'),
      })
    },
  }
}
