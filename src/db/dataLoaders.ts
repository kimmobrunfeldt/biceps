import { TXAsync } from '@vlcn.io/xplat-api'
import DataLoader from 'dataloader'
import stringify from 'json-stable-stringify'
import _ from 'lodash'
import {
  AnyDatabaseEntity,
  Person,
  Product,
  Recipe,
  RecipeItem,
  allEntities,
} from 'src/db/entities'
import { WhereConditions, is } from 'src/db/interface/entityMethods'
import { RecipeRow } from 'src/db/schemas/RecipeSchema'

export type DataLoaders = ReturnType<typeof createLoaders>

const DEFAULT_DATALOADER_OPTIONS = Object.freeze({
  cache: false,
}) satisfies DataLoader.Options<unknown, unknown>

export function createLoaders(connection: TXAsync) {
  return {
    recipesById: createSimpleLoader({ connection, entity: Recipe }),
    productsById: createSimpleLoader({ connection, entity: Product }),
    personById: createSimpleLoader({ connection, entity: Person }),
    recipeItemsById: createSimpleLoader({ connection, entity: RecipeItem }),
    recipeItemsByRecipeIds: new DataLoader(
      async (recipeIds: readonly string[]) => {
        const recipeItems = await RecipeItem.findManyByRecipeIds({
          connection,
          recipeIds,
        })
        return returnManyByReferenceIds(
          recipeIds,
          recipeItems,
          (item) => item.recipeId
        )
      },
      DEFAULT_DATALOADER_OPTIONS
    ),
    // Dedupes same where conditions
    recipeTotalCount: new DataLoader(
      async (
        whereConditions: readonly WhereConditions<RecipeRow>[]
      ): Promise<number[]> => {
        const withIndex = whereConditions.map((where, index) => ({
          where,
          index,
        }))
        const grouped = _.groupBy(withIndex, ({ where }) => stringify(where))
        const conditionsToQuery = Object.values(grouped).map((conditions) => {
          // All conditions are the same, we can just pick the first
          return conditions[0].where
        })
        const responses = await Promise.all(
          conditionsToQuery.map(async (where) => {
            const { count } = await Recipe.count({ connection, where })
            return { where, count }
          })
        )

        // TODO: Bad algorithm
        return withIndex.map(({ where }) => {
          const response = responses.find(
            (r) => stringify(r.where) === stringify(where)
          )
          if (!response) {
            throw new Error('Response not found!')
          }
          return response.count
        })
      },
      DEFAULT_DATALOADER_OPTIONS
    ),
  }
}

function createSimpleLoader<
  // App state does not have .id field
  T extends Exclude<AnyDatabaseEntity, typeof allEntities.AppState>,
>({
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

    const results = returnOneByReferenceIds(
      ids,
      entities as readonly { id: string; [key: string]: any }[],
      (entity) => entity.id
    )
    if (ids.length !== results.length) {
      console.error('Expected to find all entities with IDs', ids)
      console.error('Found the following entities', entities)
      console.error('Got the following results', results)
      throw new Error('Not all entities were found in the database')
    }
    return results
  }
  // Cast to any because https://github.com/graphql/dataloader/pull/248/
  return new DataLoader(loaderFn as any, DEFAULT_DATALOADER_OPTIONS)
}

export function returnOneByReferenceIds<T extends { [key: string]: any }>(
  referenceIds: readonly string[],
  collection: readonly T[],
  picker: (val: T) => T[keyof T] = (item) => item.id as T[keyof T]
): (T | Error)[] {
  const grouped = _.groupBy(collection, picker)
  Object.keys(grouped).forEach((key) => {
    if (grouped[key].length > 1) {
      console.error(collection, grouped)
      throw new Error('Duplicate items found in collection')
    }
  })

  const results = referenceIds.map((id) => {
    return grouped[id]
      ? grouped[id][0]
      : new Error(`Entity not found with id '${id}'`)
  })
  return results
}

export function returnManyByReferenceIds<T extends { [key: string]: any }>(
  referenceIds: readonly string[],
  collection: readonly T[],
  picker: (val: T) => T[keyof T] = (item) => item.id as T[keyof T]
): (T[] | Error)[] {
  const grouped = _.groupBy(collection, picker)
  const results = referenceIds.map((id) => {
    return grouped[id] ? grouped[id] : []
  })
  return results
}
