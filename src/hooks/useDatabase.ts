import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import _ from 'lodash'
import { APP_STATE_KEY } from 'src/constants'
import { createRecipe, upsertRecipe } from 'src/core/recipeCore'
import {
  AppState,
  Person,
  Product,
  Recipe,
  RecipeItem,
  RecurringEvent,
} from 'src/db/entities'
import { withTransaction } from 'src/db/interface/databaseMethods'
import { is } from 'src/db/interface/entityMethods'
import { resolver } from 'src/db/resolvers/resolver'
import { AppStateBeforeDatabase } from 'src/db/schemas/AppStateSchema'
import { PersonBeforeDatabase } from 'src/db/schemas/PersonSchema'
import { ProductResolvedBeforeSaving } from 'src/db/schemas/ProductSchema'
import { RecipeResolvedBeforeSaving } from 'src/db/schemas/RecipeSchema'
import { RecurringEventResolvedBeforeSaving } from 'src/db/schemas/RecurringEventSchema'
import { useDataLoaders } from 'src/hooks/useDataLoaders'
import { PaginationOpts } from 'src/hooks/usePaginatedQuery'
import {
  DatabaseContext,
  useSqlite,
  useTableLastUpdatedAt,
} from 'src/hooks/useSqlite'
import { MigrationRow } from 'src/migrations'
import { Weekday } from 'src/utils/time'
import { assertUnreachable } from 'src/utils/utils'

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

export function useGetAllRecipes({ limit, offset }: PaginationOpts) {
  const ctx = useSqlite()
  const loaders = useDataLoaders()
  const lastUpdatedAt = useTableLastUpdatedAt(['products'])

  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [
      ...getCacheKey(ctx, queryNames.getAllRecipes),
      limit,
      offset,
      lastUpdatedAt,
    ],
    queryFn: withQueryErrorHandling(queryNames.getAllRecipes, async () => {
      const recipeRows = await Recipe.findMany({
        connection: ctx.db,
        limit,
        offset,
      })
      const recipes = await Promise.all(
        recipeRows.map((row) => resolver({ row, connection: ctx.db, loaders }))
      )
      const { count } = await Recipe.count({ connection: ctx.db })
      return { results: recipes, totalCount: count }
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
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAppState),
      })
    },
  }
}

export function useLazyGetRecurringEventsByRecipeId() {
  const ctx = useSqlite()
  const loaders = useDataLoaders()

  return {
    getRecurringEventsByRecipeId: async (recipeId: string) => {
      const recurringEvents = await RecurringEvent.findMany({
        connection: ctx.db,
        where: { eventType: 'EatRecipe', recipeToEatId: recipeId },
      })
      return await Promise.all(
        recurringEvents.map((row) =>
          resolver({ row, connection: ctx.db, loaders })
        )
      )
    },
  }
}

export function useDeleteRecipe() {
  const ctx = useSqlite()
  const queryClient = useQueryClient()

  return {
    deleteRecipe: async (id: string) => {
      await Recipe.remove({
        connection: ctx.db,
        where: { id: id },
      })
      await RecipeItem.remove({
        connection: ctx.db,
        where: { recipeId: id },
      })
      await RecurringEvent.remove({
        connection: ctx.db,
        where: { eventType: 'EatRecipe', recipeToEatId: id },
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllRecurringEvents),
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllRecipes),
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getRecipe(id)),
      })
    },
  }
}

export function useGetAllCustomProducts({ limit, offset }: PaginationOpts) {
  const ctx = useSqlite()
  const loaders = useDataLoaders()
  const lastUpdatedAt = useTableLastUpdatedAt(['products'])

  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [
      ...getCacheKey(ctx, queryNames.getAllCustomProducts),
      limit,
      offset,
      lastUpdatedAt,
    ],
    queryFn: withQueryErrorHandling(
      queryNames.getAllCustomProducts,
      async () => {
        const rows = await Product.findManyCustom({
          connection: ctx.db,
          limit,
          offset,
          orderBy: ['createdAt', 'desc'],
        })
        const products = await Promise.all(
          rows.map((row) => resolver({ row, connection: ctx.db, loaders }))
        )
        const count = await Product.customCount({
          connection: ctx.db,
        })
        return { results: products, totalCount: count }
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
          limit: 10,
        })
        const products = await Promise.all(
          rows.map((row) => resolver({ row, connection: ctx.db, loaders }))
        )
        return products
      }
    ),
  })
}

export function useGetAllExternalProducts({ limit, offset }: PaginationOpts) {
  const ctx = useSqlite()
  const loaders = useDataLoaders()
  const lastUpdatedAt = useTableLastUpdatedAt(['products'])

  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [
      ...getCacheKey(ctx, queryNames.getAllExternalProducts),
      limit,
      offset,
      lastUpdatedAt,
    ],
    queryFn: withQueryErrorHandling(
      queryNames.getAllExternalProducts,
      async () => {
        const rows = await Product.findManyExternal({
          connection: ctx.db,
          limit,
          offset,
        })
        const products = await Promise.all(
          rows.map((row) => resolver({ row, connection: ctx.db, loaders }))
        )
        const count = await Product.externalCount({
          connection: ctx.db,
        })
        return { results: products, totalCount: count }
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

export function useInsertProducts() {
  const ctx = useSqlite()
  const queryClient = useQueryClient()

  return {
    insertProducts: async (products: ProductResolvedBeforeSaving[]) => {
      await Product.insertMany({
        connection: ctx.db,
        objects: products,
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllCustomProducts),
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllExternalProducts),
      })
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
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAppState),
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

export function useDeleteRecurringEvent() {
  const ctx = useSqlite()
  const queryClient = useQueryClient()

  return {
    deleteRecurringEvent: async (id: string) => {
      await RecurringEvent.remove({
        connection: ctx.db,
        where: { id: id },
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllRecurringEvents),
      })
    },
  }
}

export function useCopyDaySchedule() {
  const ctx = useSqlite()
  const queryClient = useQueryClient()

  return {
    copySchedule: async (fromWeekday: Weekday, toWeekday: Weekday) => {
      const result = await withTransaction(ctx.db, async (tx) => {
        const fromEvents = await RecurringEvent.findMany({
          connection: tx,
          where: {
            weekday: fromWeekday,
          },
        })

        if (fromEvents.length === 0) {
          return []
        }

        await RecurringEvent.remove({
          connection: tx,
          where: {
            weekday: toWeekday,
          },
        })

        return await RecurringEvent.insertMany({
          connection: tx,
          objects: fromEvents.map((event) => {
            switch (event.eventType) {
              case 'EatRecipe':
                return {
                  ..._.omit(event, [
                    'id',
                    'productToEatId',
                    'weightGramsToEat',
                  ]),
                  weekday: toWeekday,
                }

              case 'EatProduct':
                throw new Error('Copying EatProduct events is not supported')

              default:
                assertUnreachable(event)
            }
          }),
        })
      })

      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAllRecurringEvents),
      })
      return result
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

export function useUpdateAppState() {
  const ctx = useSqlite()
  const queryClient = useQueryClient()

  return {
    updateAppState: async (newValues: Partial<AppStateBeforeDatabase>) => {
      await AppState.update({
        connection: ctx.db,
        where: { key: APP_STATE_KEY },
        set: newValues,
      })
      queryClient.invalidateQueries({
        queryKey: getCacheKeyToInvalidate(queryNames.getAppState),
      })
    },
  }
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

export function useLazyGetAllUserData() {
  const ctx = useSqlite()

  return {
    getAllUserData: async () => {
      const appState = await AppState.find({
        connection: ctx.db,
        where: { key: APP_STATE_KEY },
      })
      const persons = await Person.findMany({ connection: ctx.db })
      const recipes = await Recipe.findMany({ connection: ctx.db })
      const recipeItems = await RecipeItem.findMany({ connection: ctx.db })
      const customProducts = await Product.findManyCustom({
        connection: ctx.db,
      })
      const recurringEvents = await RecurringEvent.findMany({
        connection: ctx.db,
      })
      const migrations = (await ctx.db.execO(
        'SELECT * FROM migrations'
      )) as MigrationRow[]

      return {
        migrations,
        appState,
        persons,
        recipes,
        recipeItems,
        products: customProducts,
        recurringEvents,
      }
    },
  }
}

type UserDataExport = Awaited<
  ReturnType<ReturnType<typeof useLazyGetAllUserData>['getAllUserData']>
>

export function useImportUserData() {
  const ctx = useSqlite()
  const queryClient = useQueryClient()

  return {
    importUserData: async (data: UserDataExport): Promise<number> => {
      const migrations = await ctx.db.execO('SELECT * FROM migrations')
      if (!_.isEqual(data.migrations, migrations)) {
        throw new Error('Exported data is from a different database version')
      }

      function prepareForUpsert<T extends { __type: string }>(
        data: T
      ): Omit<T, '__type'> {
        return _.omit(data, ['__type'])
      }

      let importedCount = 0

      await AppState.clientUpsert({
        connection: ctx.db,
        object: prepareForUpsert(data.appState),
        onConflict: ['key'],
      })
      importedCount++

      const mapping = {
        persons: Person,
        recipes: Recipe,
        products: Product,
        recurringEvents: RecurringEvent,
      } as const

      const keys = Object.keys(mapping) as (keyof typeof mapping)[]
      for (const key of keys) {
        const items = data[key]
        for (const item of items) {
          const Entity = mapping[key] as (typeof mapping)[typeof key]
          await Entity.clientUpsert({
            connection: ctx.db,
            object: prepareForUpsert(item), // Will be validated before upsert
            onConflict: ['id'],
          } as any)
          importedCount++
        }
      }

      for (const item of data.recipeItems) {
        await RecipeItem.clientUpsert({
          connection: ctx.db,
          object: prepareForUpsert(item),
          onConflict: ['recipeId', 'productId'],
        })
        importedCount++
      }

      queryClient.invalidateQueries()
      return importedCount
    },
  }
}
