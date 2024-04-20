import sql from 'sql-template-tag'
import { Options } from 'src/db/interface/entityInterface'
import {
  FindOptions,
  findOptionsAsSql,
  is,
  makeUtils,
} from 'src/db/interface/entityMethods'
import {
  ItemBeforeDatabaseSchema,
  ItemRow,
  ItemRowSchema,
} from 'src/db/schemas/ItemSchema'
import { z } from 'zod'

const {
  find,
  findMany,
  insert,
  update,
  remove,
  upsert,
  clientUpsert,
  createDatabaseMethodsWithTransform,
  removeAll,
} = makeUtils({
  tableName: 'items',
  beforeDatabaseSchema: ItemBeforeDatabaseSchema,
  schema: ItemRowSchema,
})

export {
  clientUpsert,
  find,
  findMany,
  insert,
  remove,
  removeAll,
  update,
  upsert,
}

// Ad-hoc schema for custom the custom method
const ItemRowWithRecipeIdSchema = ItemRowSchema.merge(
  z.object({ recipeId: z.string() })
)
type ItemRowWithRecipeId = z.infer<typeof ItemRowWithRecipeIdSchema>

export async function findManyByRecipeIds({
  connection,
  recipeIds,
}: Options & {
  recipeIds: readonly string[]
}): Promise<ItemRowWithRecipeId[]> {
  if (recipeIds.length === 0) return []

  const { whereSql } = findOptionsAsSql<ItemRowWithRecipeId>({
    where: { recipeId: is('IN', recipeIds) },
  })
  const { many } = createDatabaseMethodsWithTransform({
    connection,
    schema: ItemRowWithRecipeIdSchema,
  })
  const sqlQuery = sql`
    SELECT
      items.*,
      recipe_id
    FROM items
    LEFT JOIN recipe_items ON items.id = recipe_items.item_id
    ${whereSql}
  `
  return await many(sqlQuery)
}

export async function findManyCustom({
  connection,
  where,
  limit,
  orderBy,
}: Options & FindOptions<ItemRow>): Promise<ItemRow[]> {
  const { whereSql, limitSql, orderBySql } =
    findOptionsAsSql<ItemRowWithRecipeId>({
      where: { ...where, id: is('LIKE', 'c-%') },
      limit,
      orderBy,
    })
  const { many } = createDatabaseMethodsWithTransform({
    connection,
    schema: ItemRowSchema,
  })
  const sqlQuery = sql`
    SELECT
      *
    FROM items
    ${whereSql}
    ${orderBySql}
    ${limitSql}
  `
  return await many(sqlQuery)
}

export async function findManyExternal({
  connection,
  where = {},
  limit,
  orderBy,
}: Options & FindOptions<ItemRow>): Promise<ItemRow[]> {
  const { whereSql, limitSql, orderBySql } =
    findOptionsAsSql<ItemRowWithRecipeId>({
      where,
      limit,
      orderBy,
    })
  const { many } = createDatabaseMethodsWithTransform({
    connection,
    schema: ItemRowSchema,
  })
  const sqlQuery = sql`
    SELECT
      *
    FROM items
    ${Object.keys(where).length > 0 ? sql`${whereSql} AND id NOT LIKE 'c-%'` : sql`WHERE id NOT LIKE 'c-%'`}
    ${orderBySql}
    ${limitSql}
  `
  return await many(sqlQuery)
}
