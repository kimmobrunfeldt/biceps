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
const RecipeRowWithProductIdSchema = RecipeRowSchema.merge(
  z.object({ productId: z.string() })
)
type RecipeRowWithProductId = z.infer<typeof RecipeRowWithProductIdSchema>

export async function findManyByProductIds({
  connection,
  productIds,
}: Options & {
  productIds: readonly string[]
}): Promise<RecipeRowWithProductId[]> {
  if (productIds.length === 0) return []

  const { whereSql } = findOptionsAsSql<RecipeRowWithProductId>({
    where: { productId: is('IN', productIds) },
  })
  const { many } = createDatabaseMethodsWithTransform({
    connection,
    schema: RecipeRowWithProductIdSchema,
  })
  const sqlQuery = sql`
    SELECT
      recipes.*,
      recipe_items.product_id
    FROM recipes
    JOIN recipe_items ON recipe_items.recipe_id = recipes.id
    ${whereSql}
  `
  return await many(sqlQuery)
}
