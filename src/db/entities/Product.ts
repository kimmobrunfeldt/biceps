import sql from 'sql-template-tag'
import { DATABASE_ID_PREFIX } from 'src/constants'
import { Options } from 'src/db/interface/entityInterface'
import {
  FindOptions,
  findOptionsAsSql,
  is,
  makeUtils,
} from 'src/db/interface/entityMethods'
import {
  BaseProductRowSchema,
  ProductBeforeDatabaseSchema,
  ProductRow,
  ProductRowSchema,
} from 'src/db/schemas/ProductSchema'
import { z } from 'zod'

const {
  find,
  findMany,
  maybeFind,
  insert,
  update,
  remove,
  insertMany,
  count,
  upsert,
  clientUpsert,
  createDatabaseMethodsWithTransform,
  removeAll,
} = makeUtils({
  tableName: 'products',
  name: 'Product',
  beforeDatabaseSchema: ProductBeforeDatabaseSchema,
  schema: ProductRowSchema,
})

export {
  clientUpsert,
  count,
  find,
  findMany,
  insert,
  insertMany,
  maybeFind,
  remove,
  removeAll,
  update,
  upsert,
}

// Ad-hoc schema for the custom method
const ProductRowWithRecipeIdSchema = BaseProductRowSchema.merge(
  z.object({ recipeId: z.string() })
)
type ProductRowWithRecipeId = z.infer<typeof ProductRowWithRecipeIdSchema>

export async function findManyByRecipeIds({
  connection,
  recipeIds,
}: Options & {
  recipeIds: readonly string[]
}): Promise<ProductRowWithRecipeId[]> {
  if (recipeIds.length === 0) return []

  const { whereSql } = findOptionsAsSql<ProductRowWithRecipeId>({
    where: { recipeId: is('IN', recipeIds) },
  })
  const { many } = createDatabaseMethodsWithTransform({
    connection,
    schema: ProductRowWithRecipeIdSchema,
  })
  const sqlQuery = sql`
    SELECT
      products.*,
      recipe_id
    FROM products
    LEFT JOIN recipe_items ON products.id = recipe_items.product_id
    ${whereSql}
  `
  return await many(sqlQuery)
}

export async function findManyCustom({
  connection,
  where,
  limit,
  offset,
  orderBy,
}: Options & FindOptions<ProductRow>): Promise<ProductRow[]> {
  const { whereSql, limitSql, orderBySql } =
    findOptionsAsSql<ProductRowWithRecipeId>({
      where: { ...where, id: is('LIKE', `${DATABASE_ID_PREFIX}-%`) },
      limit,
      offset,
      orderBy,
    })
  const { many } = createDatabaseMethodsWithTransform({
    connection,
    schema: ProductRowSchema,
  })
  const sqlQuery = sql`
    SELECT
      *
    FROM products
    ${whereSql}
    ${orderBySql}
    ${limitSql}
  `
  return await many(sqlQuery)
}

export async function customCount({
  connection,
  where,
}: Options & FindOptions<ProductRow>): Promise<number> {
  const { whereSql } = findOptionsAsSql<ProductRowWithRecipeId>({
    where: { ...where, id: is('LIKE', `${DATABASE_ID_PREFIX}-%`) },
  })
  const { one } = createDatabaseMethodsWithTransform({
    connection,
    schema: z.object({ count: z.number() }).strict(),
  })
  const sqlQuery = sql`
    SELECT
      COUNT(*) as count
    FROM products
    ${whereSql}
  `
  return (await one(sqlQuery)).count
}

export async function findManyExternal({
  connection,
  where = {},
  limit,
  offset,
  orderBy,
}: Options & FindOptions<ProductRow>): Promise<ProductRow[]> {
  const { whereSql, limitSql, orderBySql } =
    findOptionsAsSql<ProductRowWithRecipeId>({
      where,
      limit,
      offset,
      orderBy,
    })
  const { many } = createDatabaseMethodsWithTransform({
    connection,
    schema: ProductRowSchema,
  })
  const sqlQuery = sql`
    SELECT
      *
    FROM products
    ${
      Object.keys(where).length > 0
        ? sql`${whereSql} AND id NOT LIKE ${`${DATABASE_ID_PREFIX}-%`}`
        : sql`WHERE id NOT LIKE ${`${DATABASE_ID_PREFIX}-%`}`
    }
    ${orderBySql}
    ${limitSql}
  `
  return await many(sqlQuery)
}

export async function externalCount({
  connection,
  where = {},
}: Options & FindOptions<ProductRow>): Promise<number> {
  const { whereSql } = findOptionsAsSql<ProductRowWithRecipeId>({
    where,
  })
  const { one } = createDatabaseMethodsWithTransform({
    connection,
    schema: z.object({ count: z.number() }).strict(),
  })
  const sqlQuery = sql`
    SELECT
      COUNT(*) as count
    FROM products
    ${
      Object.keys(where).length > 0
        ? sql`${whereSql} AND id NOT LIKE ${`${DATABASE_ID_PREFIX}-%`}`
        : sql`WHERE id NOT LIKE ${`${DATABASE_ID_PREFIX}-%`}`
    }
  `
  return (await one(sqlQuery)).count
}
