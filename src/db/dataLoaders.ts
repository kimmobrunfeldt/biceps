import { CtxAsync } from '@vlcn.io/react'
import DataLoader from 'dataloader'
import _ from 'lodash'
import { AnyDatabaseEntity, Item, Recipe, RecipeItem } from 'src/db/entities'
import { is } from 'src/db/interface/entityMethods'

export type Loaders = ReturnType<typeof createLoaders>

export function createLoaders(ctx: CtxAsync) {
  return {
    recipesById: createSimpleLoader({ ctx, entity: Recipe }),
    itemsById: createSimpleLoader({ ctx, entity: Item }),
    itemsByRecipeIds: new DataLoader(async (recipeIds: readonly string[]) => {
      const items = await Item.findManyByRecipeIds({
        ctx,
        recipeIds,
      })
      return groupAndSortByReference(items, recipeIds, (item) => item.recipeId)
    }),
    recipeItemsById: createSimpleLoader({ ctx, entity: RecipeItem }),
  }
}

// TODO: Convert to react hook
/*
export function getLoaders() {
  // Return from request context if request available
  const loadersFromContext = requestContext.maybeGet('loaders')
  if (loadersFromContext) {
    return loadersFromContext
  }
  // This should happen only on background workers
  return createLoaders()
}
*/

function createSimpleLoader<T extends AnyDatabaseEntity>({
  entity: Entity,
  ctx,
}: {
  entity: T
  ctx: CtxAsync
}): DataLoader<string, Awaited<ReturnType<T['find']>>, string> {
  const loaderFn = async (ids: readonly string[]) => {
    const entities = await Entity.findMany({
      ctx,
      where: { id: is('IN', ids) },
    })
    // @ts-expect-error Wasn't able to make TS happy
    const sorted = sortByReference(entities, ids, (entity) => entity.id)
    return sorted
  }
  // Cast to any because https://github.com/graphql/dataloader/pull/248/
  return new DataLoader(loaderFn as any)
}

export function sortByReference<T extends { [key: string]: any }>(
  collection: readonly T[],
  referenceValues: readonly string[],
  picker: (val: T) => T[keyof T] = (item) => item.id as T[keyof T]
): T[] {
  const sortedCollection = _.sortBy(collection, (item) => {
    return referenceValues.indexOf(picker(item))
  })
  return sortedCollection
}

export function groupAndSortByReference<T extends { [key: string]: any }>(
  collection: readonly T[],
  referenceValues: readonly string[],
  picker: (val: T) => T[keyof T] = (item) => item.id as T[keyof T]
): T[][] {
  const grouped = _.groupBy(collection, picker)
  const groupedAndSortedCollection = referenceValues.map((item) => {
    const result = grouped[item]
    return result ? result : []
  })
  return groupedAndSortedCollection
}
