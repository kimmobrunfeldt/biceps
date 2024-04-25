import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { APP_STATE_KEY, INDEXEDDB_NAME } from 'src/constants'
import { createRecipe, upsertRecipe } from 'src/core/recipeCore'
import {
  AppState,
  Person,
  Product,
  Recipe,
  RecipeItem,
  RecurringEvent,
} from 'src/db/entities'
import { is } from 'src/db/interface/entityMethods'
import { resolver } from 'src/db/resolvers/resolver'
import { PersonBeforeDatabase } from 'src/db/schemas/PersonSchema'
import { ProductResolvedBeforeSaving } from 'src/db/schemas/ProductSchema'
import { RecipeResolvedBeforeSaving } from 'src/db/schemas/RecipeSchema'
import { RecurringEventResolvedBeforeSaving } from 'src/db/schemas/RecurringEventSchema'
import { useDataLoaders } from 'src/hooks/useDataLoaders'
import {
  DatabaseContext,
  useSqlite,
  useTableLastUpdatedAt,
} from 'src/hooks/useSqlite'

const queryNames = {
  getAppState: 'getAppState',
  getAllRecipes: 'getAllRecipes',
  getRecipe: (id: string) => `getRecipe-${id}`,
  getAllCustomProducts: 'getAllCustomProducts',
  useCustomProductSearch: 'useCustomProductSearch',
  getAllExternalProducts: 'getAllExternalProducts',
  getProduct: (id: string) => `getProduct-${id}`,
  getRecurringEvent: (id: string) => `getRecurringEvent-${id}`,
  getAllRecurringEvents: 'getAllRecurringEvents',
}

/**
 * Cache key prefix to use for all SQL related queries.
 */
const SQL_QUERY_CACHE_KEY = 'sqlQuery'

function getCacheKey(ctx: DatabaseContext, key: string): string[] {
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
  const ctx = useSqlite()
  const loaders = useDataLoaders()
  const lastUpdatedAt = useTableLastUpdatedAt(['products'])

  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [...getCacheKey(ctx, queryNames.getAllRecipes), lastUpdatedAt],
    queryFn: withQueryErrorHandling(queryNames.getAllRecipes, async () => {
      const recipeRows = await Recipe.findMany({ connection: ctx.db })
      const recipes = await Promise.all(
        recipeRows.map((row) => resolver({ row, connection: ctx.db, loaders }))
      )
      return recipes
    }),
  })
}

export function useGetRecipe(id: string) {
  const ctx = useSqlite()
  const loaders = useDataLoaders()
  const lastUpdatedAt = useTableLastUpdatedAt(['recipes'])

  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [...getCacheKey(ctx, queryNames.getRecipe(id)), lastUpdatedAt],
    queryFn: withQueryErrorHandling(queryNames.getRecipe(id), async () => {
      const recipe = await Recipe.maybeFind({
        where: { id },
        connection: ctx.db,
      })
      if (!recipe) return null
      return await resolver({ row: recipe, connection: ctx.db, loaders })
    }),
  })
}

export function useUpsertRecipe() {
  const ctx = useSqlite()
  const queryClient = useQueryClient()

  return {
    upsertRecipe: async (recipe: RecipeResolvedBeforeSaving) => {
      await upsertRecipe(ctx.db, recipe)

      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllRecipes),
      })

      if (recipe.id) {
        queryClient.invalidateQueries({
          queryKey: getCacheKeyToInvalidate(queryNames.getRecipe(recipe.id)),
        })
      }
    },
  }
}

export function useCreateRecipe() {
  const ctx = useSqlite()
  const queryClient = useQueryClient()

  return {
    createRecipe: async (recipe: RecipeResolvedBeforeSaving) => {
      await createRecipe(ctx.db, recipe)
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllRecipes),
      })
    },
  }
}

export function useGetAllCustomProducts() {
  const ctx = useSqlite()
  const loaders = useDataLoaders()
  const lastUpdatedAt = useTableLastUpdatedAt(['products'])

  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [
      ...getCacheKey(ctx, queryNames.getAllCustomProducts),
      lastUpdatedAt,
    ],
    queryFn: withQueryErrorHandling(
      queryNames.getAllCustomProducts,
      async () => {
        const rows = await Product.findManyCustom({
          connection: ctx.db,
          orderBy: ['createdAt', 'desc'],
        })
        const products = await Promise.all(
          rows.map((row) => resolver({ row, connection: ctx.db, loaders }))
        )
        return products
      }
    ),
  })
}

export function useCustomProductSearch({
  searchTerms,
}: {
  searchTerms: string
}) {
  const ctx = useSqlite()
  const loaders = useDataLoaders()
  // Don't use table reactivity here as it could potentially make searching UX confusing

  return useQuery({
    queryKey: [
      ...getCacheKey(ctx, queryNames.getAllCustomProducts),
      searchTerms,
    ],
    queryFn: withQueryErrorHandling(
      queryNames.getAllCustomProducts,
      async () => {
        const rows = await Product.findManyCustom({
          connection: ctx.db,
          where: { name: is('LIKE', `%${searchTerms}%`) },
        })
        const products = await Promise.all(
          rows.map((row) => resolver({ row, connection: ctx.db, loaders }))
        )
        return products
      }
    ),
  })
}

export function useGetAllExternalProducts() {
  const ctx = useSqlite()
  const loaders = useDataLoaders()
  const lastUpdatedAt = useTableLastUpdatedAt(['products'])

  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [
      ...getCacheKey(ctx, queryNames.getAllExternalProducts),
      lastUpdatedAt,
    ],
    queryFn: withQueryErrorHandling(
      queryNames.getAllExternalProducts,
      async () => {
        const rows = await Product.findManyExternal({ connection: ctx.db })
        const products = await Promise.all(
          rows.map((row) => resolver({ row, connection: ctx.db, loaders }))
        )
        return products
      }
    ),
  })
}

export function useLazyGetRecipesByProductId() {
  const ctx = useSqlite()
  const loaders = useDataLoaders()

  return {
    getRecipesByProductId: async (productId: string) => {
      const recipes = await Recipe.findManyByProductIds({
        connection: ctx.db,
        productIds: [productId],
      })
      return await Promise.all(
        recipes.map((row) => resolver({ row, connection: ctx.db, loaders }))
      )
    },
  }
}

export function useGetProduct(id: string) {
  const ctx = useSqlite()
  const loaders = useDataLoaders()
  const lastUpdatedAt = useTableLastUpdatedAt(['products'])

  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [...getCacheKey(ctx, queryNames.getProduct(id)), lastUpdatedAt],
    queryFn: withQueryErrorHandling(queryNames.getProduct(id), async () => {
      const product = await Product.maybeFind({
        where: { id },
        connection: ctx.db,
      })
      if (!product) return null
      return await resolver({ row: product, connection: ctx.db, loaders })
    }),
  })
}

export function useUpsertProduct() {
  const ctx = useSqlite()
  const queryClient = useQueryClient()

  return {
    upsertProduct: async (product: ProductResolvedBeforeSaving) => {
      await Product.clientUpsert({
        connection: ctx.db,
        object: product,
        onConflict: ['id'],
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllCustomProducts),
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllExternalProducts),
      })

      if (product.id) {
        queryClient.invalidateQueries({
          queryKey: getCacheKeyToInvalidate(queryNames.getProduct(product.id)),
        })
      }
    },
  }
}

export function useDeleteProduct() {
  const ctx = useSqlite()
  const queryClient = useQueryClient()

  return {
    deleteProduct: async (productId: string) => {
      await Product.remove({
        connection: ctx.db,
        where: { id: productId },
      })
      await RecipeItem.remove({
        connection: ctx.db,
        where: { productId },
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllCustomProducts),
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllExternalProducts),
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getProduct(productId)),
      })
    },
  }
}

export function useUpsertRecurringEvent() {
  const ctx = useSqlite()
  const queryClient = useQueryClient()

  return {
    upsertRecurringEvent: async (
      recurringEvent: RecurringEventResolvedBeforeSaving
    ) => {
      const { time, ...rest } = recurringEvent
      await RecurringEvent.clientUpsert({
        connection: ctx.db,
        object: { ...rest, hour: time.hour, minute: time.minute },
        onConflict: ['id'],
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllRecurringEvents),
      })

      if (recurringEvent.id) {
        queryClient.invalidateQueries({
          queryKey: getCacheKeyToInvalidate(
            queryNames.getRecurringEvent(recurringEvent.id)
          ),
        })
      }
    },
  }
}

export function useGetAllRecurringEvents() {
  const ctx = useSqlite()
  const loaders = useDataLoaders()
  const lastUpdatedAt = useTableLastUpdatedAt(['recurring_events'])

  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [
      ...getCacheKey(ctx, queryNames.getAllRecurringEvents),
      lastUpdatedAt,
    ],
    queryFn: withQueryErrorHandling(
      queryNames.getAllRecurringEvents,
      async () => {
        const rows = await RecurringEvent.findMany({ connection: ctx.db })
        const recurringEvents = await Promise.all(
          rows.map((row) => resolver({ row, connection: ctx.db, loaders }))
        )
        return recurringEvents
      }
    ),
  })
}

export function useDeleteAllData() {
  const ctx = useSqlite()
  const queryClient = useQueryClient()

  return {
    deleteAllData: async () => {
      await ctx.db.close()
      await indexedDB.deleteDatabase(INDEXEDDB_NAME)
      queryClient.invalidateQueries()
    },
  }
}

export function useGetAppState() {
  const ctx = useSqlite()
  const loaders = useDataLoaders()
  const lastUpdatedAt = useTableLastUpdatedAt(['app_state'])

  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [...getCacheKey(ctx, queryNames.getAppState), lastUpdatedAt],
    queryFn: withQueryErrorHandling(queryNames.getAppState, async () => {
      const appState = await AppState.find({
        connection: ctx.db,
        where: { key: APP_STATE_KEY },
      })
      const resolved = await resolver({
        row: appState,
        connection: ctx.db,
        loaders,
      })
      return resolved
    }),
  })
}

export function useUpdatePerson() {
  const ctx = useSqlite()
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
        queryKey: getCacheKeyToInvalidate(queryNames.getAppState),
      })
    },
  }
}
