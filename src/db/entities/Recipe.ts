import sql from 'sql-template-tag'
import { Options } from 'src/db/interface/entityInterface'
import { findOptionsAsSql, is, makeUtils } from 'src/db/interface/entityMethods'
import {
  RecipeBeforeDatabaseSchema,
  RecipeRowSchema,
} from 'src/db/schemas/RecipeSchema'
import { z } from 'zod'

const {
  find,
  findMany,
  maybeFind,
  insert,
  update,
  remove,
  upsert,
  clientUpsert,
  removeAll,
  createDatabaseMethodsWithTransform,
} = makeUtils({
  tableName: 'recipes',
  beforeDatabaseSchema: RecipeBeforeDatabaseSchema,
  schema: RecipeRowSchema,
})

export {
  clientUpsert,
  find,
  findMany,
  insert,
  maybeFind,
  remove,
  removeAll,
  update,
  upsert,
}

// Ad-hoc schema for the custom method
const RecipeRowWithItemIdSchema = RecipeRowSchema.merge(
  z.object({ itemId: z.string() })
)
type RecipeRowWithItemId = z.infer<typeof RecipeRowWithItemIdSchema>

export async function findManyByProductIds({
  connection,
  productIds,
}: Options & {
  productIds: readonly string[]
}): Promise<RecipeRowWithItemId[]> {
  if (productIds.length === 0) return []

  const { whereSql } = findOptionsAsSql<RecipeRowWithItemId>({
    where: { itemId: is('IN', productIds) },
  })
  const { many } = createDatabaseMethodsWithTransform({
    connection,
    schema: RecipeRowWithItemIdSchema,
  })
  const sqlQuery = sql`
    SELECT
      recipes.*,
      recipe_items.item_id
    FROM recipes
    JOIN recipe_items ON recipe_items.recipe_id = recipes.id
    ${whereSql}
  `
  return await many(sqlQuery)
}
