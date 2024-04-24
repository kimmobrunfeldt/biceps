import sql from 'sql-template-tag'
import { Options } from 'src/db/interface/entityInterface'
import { findOptionsAsSql, is, makeUtils } from 'src/db/interface/entityMethods'
import {
  RecipeItemBeforeDatabaseSchema,
  RecipeItemRow,
  RecipeItemRowSchema,
} from 'src/db/schemas/RecipeItemSchema'

const {
  find,
  findMany,
  insert,
  upsert,
  clientUpsert,
  remove,
  removeAll,
  createDatabaseMethodsWithTransform,
} = makeUtils({
  tableName: 'recipe_items',
  name: 'RecipeItem',
  beforeDatabaseSchema: RecipeItemBeforeDatabaseSchema,
  schema: RecipeItemRowSchema,
})

export { clientUpsert, find, findMany, insert, remove, removeAll, upsert }

export async function findManyByRecipeIds({
  connection,
  recipeIds,
}: Options & {
  recipeIds: readonly string[]
}): Promise<RecipeItemRow[]> {
  if (recipeIds.length === 0) return []

  const { whereSql } = findOptionsAsSql<RecipeItemRow>({
    where: { recipeId: is('IN', recipeIds) },
    orderBy: ['createdAt', 'asc'],
  })
  const { many } = createDatabaseMethodsWithTransform({
    connection,
    schema: RecipeItemRowSchema,
  })
  const sqlQuery = sql`
    SELECT * FROM recipe_items
    ${whereSql}
  `
  return await many(sqlQuery)
}
