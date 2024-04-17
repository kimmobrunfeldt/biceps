import { TXAsync } from '@vlcn.io/xplat-api'
import DataLoader from 'dataloader'
import _ from 'lodash'
import {
  AnyDatabaseEntity,
  Item,
  Person,
  Recipe,
  RecipeItem,
} from 'src/db/entities'
import { is } from 'src/db/interface/entityMethods'

export type DataLoaders = ReturnType<typeof createLoaders>

const DEFAULT_DATALOADER_OPTIONS = Object.freeze({
  cache: false,
}) satisfies DataLoader.Options<unknown, unknown>

export function createLoaders(connection: TXAsync) {
  return {
    recipesById: createSimpleLoader({ connection, entity: Recipe }),
    itemsById: createSimpleLoader({ connection, entity: Item }),
    personById: createSimpleLoader({ connection, entity: Person }),
    recipeItemsByRecipeIds: new DataLoader(
      async (recipeIds: readonly string[]) => {
        const recipeItems = await RecipeItem.findManyByRecipeIds({
          connection,
          recipeIds,
        })
        return groupAndSortByReference(
          recipeItems,
          recipeIds,
          (item) => item.recipeId
        )
      },
      DEFAULT_DATALOADER_OPTIONS
    ),

    recipeItemsById: createSimpleLoader({ connection, entity: RecipeItem }),
  }
}

function createSimpleLoader<T extends AnyDatabaseEntity>({
  entity: Entity,
  connection,
}: {
  entity: T
  connection: TXAsync
}): DataLoader<string, Awaited<ReturnType<T['find']>>, string> {
  const loaderFn = async (ids: readonly string[]) => {
    const entities = await Entity.findMany({
      connection,
      where: { id: is('IN', ids) },
    })
    if (ids.length !== entities.length) {
      throw new Error('Not all entities were found in the database')
    }
    // @ts-expect-error Wasn't able to make TS happy
    const sorted = sortByReference(entities, ids, (entity) => entity.id)
    return sorted
  }
  // Cast to any because https://github.com/graphql/dataloader/pull/248/
  return new DataLoader(loaderFn as any, DEFAULT_DATALOADER_OPTIONS)
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
