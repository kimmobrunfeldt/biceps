import _ from 'lodash'
import sql, { Sql, join, raw } from 'sql-template-tag'
import { createDatabaseMethods } from 'src/db/interface/databaseMethods'
import { Options } from 'src/db/interface/entityInterface'
import { parse } from 'src/db/schemas/common'
import { getLogger, withSqlLogging } from 'src/utils/logger'
import { isNotUndefined } from 'src/utils/typeUtils'
import { deepOmitBy } from 'src/utils/utils'
import { ZodSchema, z } from 'zod'

// Root condition is AND by default, so only OR makes sense in the root
export type WhereConditions<FullObjT extends Record<string, any>> = Partial<
  WhereObject<FullObjT>
> & {
  OR?: SubConditions<FullObjT>
}

export type SubConditions<FullObjT extends Record<string, any>> = Partial<
  WhereObject<FullObjT>
> & {
  AND?: SubConditions<FullObjT>
  OR?: SubConditions<FullObjT>
}

type ComparisonToken = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'IN' | 'LIKE'
type Comparison<T> = { comparison: ComparisonToken; value: T | readonly T[] }

type WhereObject<FullObjT extends Record<string, any>> = {
  [K in keyof FullObjT]: FullObjT[K] | Comparison<FullObjT[K]>
}

export type FindOptions<T extends Record<string, any>> = {
  where?: WhereConditions<T>
  limit?: number
  offset?: number
  orderBy?: OrderBy<T>
}

/**
 * Crates a basic set of entity methods that can be used as a starting point.
 */
export function makeUtils<
  BeforeDatabaseSchemaT extends ZodSchema,
  SchemaT extends ZodSchema,
>({
  tableName: inputTableName,
  beforeDatabaseSchema,
  schema,
  name,
}: {
  tableName: string
  beforeDatabaseSchema: BeforeDatabaseSchemaT
  schema: SchemaT
  name: string
}) {
  const logger = getLogger(`db:${name}`)
  const createDatabaseMethodsWithTransform: typeof createDatabaseMethods = (
    opts
  ) => {
    return createDatabaseMethods({ ...opts, transformRow: camelCaseObject })
  }

  const table = identifier([inputTableName])

  function baseInsertAsSql(objects: z.infer<BeforeDatabaseSchemaT>[]) {
    const first = objects[0]
    const validObject = parse(first, beforeDatabaseSchema)
    const keys = Object.keys(validObject)
    const filteredKeys = keys.filter(
      (key) => !_.isUndefined(validObject[key]) && key !== '__type'
    )

    const values = objects.map((object) => {
      const valid = parse(object, beforeDatabaseSchema)
      return sql`
        (
          ${join(
            filteredKeys.map((key) => valueToSqlSuitable(valid[key])),
            ', '
          )}
        )
      `
    })
    return sql`
      INSERT INTO ${table} (
        ${join(
          filteredKeys.map((key) => entityKeyToColumn(key)),
          ', '
        )}
      ) VALUES ${join(values, ', ')}
    `
  }

  function insertAsSql(objects: z.infer<BeforeDatabaseSchemaT>[]) {
    return sql`
      ${baseInsertAsSql(objects)}
      RETURNING *
    `
  }

  function upsertAsSql({
    object,
    onConflict,
  }: {
    /**
     * Object to insert or update.
     */
    object: z.infer<BeforeDatabaseSchemaT>
    /**
     * Either a list of column keys to use in the ON CONFLICT clause or a custom sql fragment for constraints.
     */
    onConflict: Sql | (keyof z.infer<SchemaT> & string)[]
  }) {
    const keys = Object.keys(object)
    const filteredKeys = keys.filter((key) => !_.isUndefined(object[key]))

    return sql`
      ${baseInsertAsSql([object])}
      ON CONFLICT ${
        _.isArray(onConflict)
          ? sql`(${join(
              onConflict.map((k) => entityKeyToColumn(k)),
              ', '
            )})`
          : onConflict
      }
      DO UPDATE SET ${join(
        filteredKeys.map(
          (key) =>
            sql`${entityKeyToColumn(key)} = EXCLUDED.${entityKeyToColumn(key)}`
        ),
        ',\n'
      )}
      RETURNING *
    `
  }

  async function find({
    connection,
    where,
    orderBy,
    offset,
    // Default limit to 2 to prevent accidental large queries but still allow to throw
    // when the where criteria returns more than one row.
    limit = 2,
  }: Options & FindOptions<z.infer<SchemaT>>): Promise<z.infer<SchemaT>> {
    const { limitSql, orderBySql, whereSql } = findOptionsAsSql({
      where,
      orderBy,
      limit,
      offset,
    })
    const sqlQuery = sql`
      SELECT * FROM ${table}
      ${whereSql}
      ${orderBySql}
      ${limitSql}
    `
    const { one } = createDatabaseMethodsWithTransform({ connection, schema })
    return await withSqlLogging({
      logger,
      sqlQuery,
      methodName: 'find',
      cb: () => one(sqlQuery),
    })
  }

  async function maybeFind({
    connection,
    where,
    orderBy,
    offset,
    limit = 2,
  }: Options & FindOptions<z.infer<SchemaT>>): Promise<z.infer<SchemaT>> {
    const { limitSql, orderBySql, whereSql } = findOptionsAsSql({
      where,
      orderBy,
      limit,
      offset,
    })
    const sqlQuery = sql`
      SELECT * FROM ${table}
      ${whereSql}
      ${orderBySql}
      ${limitSql}
    `
    const { maybeOne } = createDatabaseMethodsWithTransform({
      connection,
      schema,
    })
    return await withSqlLogging({
      logger,
      sqlQuery,
      methodName: 'maybeFind',
      cb: () => maybeOne(sqlQuery),
    })
  }

  const countSchema = z.object({ count: z.number() }).strict()

  async function count({
    connection,
    where,
    limit,
    offset,
  }: Options & FindOptions<z.infer<SchemaT>>): Promise<
    z.infer<typeof countSchema>
  > {
    const { whereSql, limitSql } = findOptionsAsSql({
      where,
      limit,
      offset,
    })

    const sqlQuery = sql`
      SELECT COUNT(*) as count FROM ${table}
      ${whereSql}
      ${limitSql}
    `
    const { one } = createDatabaseMethodsWithTransform({
      connection,
      schema: countSchema,
    })
    return await withSqlLogging({
      logger,
      sqlQuery,
      methodName: 'count',
      cb: () => one(sqlQuery),
    })
  }

  async function findMany({
    connection,
    where,
    limit,
    offset,
    orderBy,
  }: Options & FindOptions<z.infer<SchemaT>>): Promise<
    readonly z.infer<SchemaT>[]
  > {
    const { limitSql, orderBySql, whereSql } = findOptionsAsSql({
      where,
      orderBy,
      offset,
      limit,
    })
    const sqlQuery = sql`
      SELECT * FROM ${table}
      ${whereSql}
      ${orderBySql}
      ${limitSql}
    `
    const { many } = createDatabaseMethodsWithTransform({ connection, schema })
    return await withSqlLogging({
      logger,
      sqlQuery,
      methodName: 'findMany',
      cb: () => many(sqlQuery),
    })
  }

  async function insert({
    object,
    connection,
  }: Options & { object: z.infer<BeforeDatabaseSchemaT> }): Promise<
    z.infer<SchemaT>
  > {
    const sqlQuery = insertAsSql([object])
    const { one } = createDatabaseMethodsWithTransform({ connection, schema })
    return await withSqlLogging({
      logger,
      sqlQuery,
      methodName: 'insert',
      cb: () => one(sqlQuery),
    })
  }

  async function insertMany({
    objects,
    connection,
  }: Options & { objects: z.infer<BeforeDatabaseSchemaT>[] }): Promise<
    z.infer<SchemaT>[]
  > {
    const sqlQuery = insertAsSql(objects)
    const { many } = createDatabaseMethodsWithTransform({ connection, schema })
    return await withSqlLogging({
      logger,
      sqlQuery,
      methodName: 'insertMany',
      cb: () => many(sqlQuery),
    })
  }

  async function upsert({
    object,
    onConflict,
    connection,
  }: Options & {
    /**
     * Object to insert or update.
     */
    object: z.infer<BeforeDatabaseSchemaT> &
      Partial<Omit<z.infer<SchemaT>, keyof z.infer<BeforeDatabaseSchemaT>>>
    /**
     * Either a list of column keys to use in the ON CONFLICT clause or a custom sql fragment for constraints.
     */
    onConflict: Sql | (keyof z.infer<SchemaT> & string)[]
  }): Promise<z.infer<SchemaT>> {
    const sqlQuery = upsertAsSql({ object, onConflict })
    const { one } = createDatabaseMethodsWithTransform({ connection, schema })
    return await withSqlLogging({
      logger,
      sqlQuery,
      methodName: 'upsert',
      cb: () => one(sqlQuery),
    })
  }

  /**
   * Upsert but implemented on the client side. Not safe for environments
   * with concurrent writes to the database.
   */
  async function clientUpsert({
    object,
    onConflict,
    connection,
  }: Options & {
    /**
     * Object to insert or update.
     */
    object: z.infer<BeforeDatabaseSchemaT> &
      Partial<Omit<z.infer<SchemaT>, keyof z.infer<BeforeDatabaseSchemaT>>>
    /**
     * Either a list of column keys to use in the ON CONFLICT clause or a custom sql fragment for constraints.
     */
    onConflict: Sql | (keyof z.infer<SchemaT> & string)[]
  }): Promise<z.infer<SchemaT>> {
    logger.info('Executing .clientUpsert method')
    if (!_.isArray(onConflict)) {
      throw new Error('clientUpsert requires onConflict to be an array')
    }
    const validObject = parse(object, beforeDatabaseSchema)
    const onConflictWhere = _.pick(validObject, onConflict) as WhereConditions<
      z.infer<SchemaT>
    >
    const found = await maybeFind({ connection, where: onConflictWhere })
    if (found) {
      return await update({
        connection,
        where: onConflictWhere,
        set: validObject,
      })
    }

    return await insert({ connection, object: validObject })
  }

  async function update({
    set,
    connection,
    where,
  }: Options & {
    set: Partial<z.infer<BeforeDatabaseSchemaT>>
    where: WhereConditions<z.infer<SchemaT>>
  }): Promise<z.infer<SchemaT>> {
    const keys: string[] = Object.keys(set).filter((key) => key !== '__type')
    const updates = keys
      .map((key) => {
        const column = entityKeyToColumn(key)
        const newValue = set[key]
        if (newValue === undefined) {
          return undefined
        } else if (newValue === null) {
          return sql`${column} = NULL`
        } else {
          return sql`${column} = ${valueToSqlSuitable(newValue)}`
        }
      })
      .filter(isNotUndefined)

    if (updates.length === 0) {
      return await find({
        connection,
        where,
      })
    }

    const sqlQuery = sql`
      UPDATE ${table}
      SET ${join(updates, ', ')}
      WHERE ${whereAsSql(where)}
      RETURNING *
    `
    const { one } = createDatabaseMethodsWithTransform({ connection, schema })
    return await withSqlLogging({
      logger,
      sqlQuery,
      methodName: 'update',
      cb: () => one(sqlQuery),
    })
  }

  async function remove({
    connection,
    where,
  }: Options & {
    where: WhereConditions<z.infer<SchemaT>>
  }): Promise<void> {
    const sqlQuery = sql`
      DELETE FROM ${table} WHERE ${whereAsSql(where)}
    `
    return await withSqlLogging({
      logger,
      sqlQuery,
      methodName: 'upsert',
      cb: () => connection.exec(sqlQuery.sql, sqlQuery.values),
    })
  }

  async function removeAll({ connection }: Options): Promise<void> {
    const sqlQuery = sql`DELETE FROM ${table}`
    return await withSqlLogging({
      logger,
      sqlQuery,
      methodName: 'removeAll',
      cb: () => connection.exec(sqlQuery.sql, sqlQuery.values),
    })
  }

  return {
    find,
    count,
    maybeFind,
    findMany,
    insert,
    insertMany,
    upsert,
    clientUpsert,
    update,
    remove,
    removeAll,
    createDatabaseMethodsWithTransform,
  }
}

export function findOptionsAsSql<T extends Record<string, any>>({
  where = {},
  orderBy,
  offset,
  limit,
}: FindOptions<T>) {
  const offsetSql = offset ? sql` OFFSET ${offset}` : sql``
  return {
    whereSql:
      Object.keys(where).length > 0 ? sql`WHERE ${whereAsSql(where)}` : sql``,
    limitSql: limit ? sql`LIMIT ${limit}${offsetSql}` : sql``,
    orderBySql: orderBy ? orderByAsSql(orderBy) : sql``,
  }
}

function whereAsSql(where: WhereConditions<ZodSchema>) {
  if (Object.keys(where).length === 0) {
    return sql`TRUE`
  }

  const compactWhere = deepOmitBy(where, _.isUndefined)
  return whereConditionsAsSql('AND', compactWhere)
}

export function whereConditionsAsSql(
  type: 'OR' | 'AND',
  conditions: SubConditions<Record<string, any>>
) {
  const { OR, AND, ...others } = conditions
  const joiner = type === 'OR' ? sql` OR ` : sql` AND `
  const baseConditions = entityConditionsAsSql(type, others)
  const isBaseCondition = Object.keys(others).length > 0

  const andTokenNeeded = isBaseCondition
  const andToken = andTokenNeeded ? joiner : sql``
  const andConditions: Sql = AND
    ? sql`${andToken}${whereConditionsAsSql('AND', AND)}`
    : sql``

  const orTokenNeeded = isBaseCondition || !_.isUndefined(AND)
  const orToken = orTokenNeeded ? joiner : sql``
  const orConditions: Sql = OR
    ? sql`${orToken}${whereConditionsAsSql('OR', OR)}`
    : sql``
  return sql`${baseConditions}${andConditions}${orConditions}`
}

export function is<T>(comparison: ComparisonToken, value: T) {
  return { comparison, value }
}

function comparisonAsSql<T>(comparison: Comparison<T>): Sql {
  switch (comparison.comparison) {
    case '=':
      return sql`= ${valueToSqlSuitable(comparison.value)}`
    case '!=':
      return sql`!= ${valueToSqlSuitable(comparison.value)}`
    case '>':
      return sql`> ${valueToSqlSuitable(comparison.value)}`
    case '>=':
      return sql`>= ${valueToSqlSuitable(comparison.value)}`
    case '<':
      return sql`< ${valueToSqlSuitable(comparison.value)}`
    case '<=':
      return sql`<= ${valueToSqlSuitable(comparison.value)}`
    case 'LIKE':
      return sql`LIKE ${valueToSqlSuitable(comparison.value)}`
    case 'IN': {
      const arr = _.isArray(comparison.value)
        ? comparison.value
        : [comparison.value]
      return sql` IN (${join(arr.map(valueToSqlSuitable), ', ')})`
    }
    default:
      throw new Error(`Unknown comparison: ${comparison.comparison}`)
  }
}

function entityConditionsAsSql(
  type: 'OR' | 'AND',
  entityConditions: Record<string, any>
) {
  const keys = Object.keys(entityConditions)
  if (keys.length === 0) {
    return sql``
  }

  const conditions = keys.map((key) => {
    const value = entityConditions[key]
    if (isComparison(value)) {
      return sql`${entityKeyToColumn(key)} ${comparisonAsSql(value)}`
    }

    return sql`${entityKeyToColumn(key)} = ${valueToSqlSuitable(value)}`
  })
  const joiner = type === 'OR' ? ' OR ' : ' AND '
  return sql`(${join(conditions, joiner)})`
}

function isComparison<T>(val: unknown): val is Comparison<T> {
  return _.isPlainObject(val) && _.has(val, 'comparison') && _.has(val, 'value')
}

type OrderByTuple<T extends string> = [T, 'asc' | 'desc']
type OrderBy<T extends Record<string, unknown>> =
  | keyof T
  | OrderByTuple<keyof T & string>
  | Array<OrderByTuple<keyof T & string>>
function orderByAsSql<T extends Record<string, unknown>>(orderBy: OrderBy<T>) {
  if (typeof orderBy === 'string') {
    return sql`ORDER BY ${entityKeyToColumn(orderBy)}`
  }

  // 'col'
  if (_.isArray(orderBy) && orderBy.length === 0) {
    return sql``
  }

  // ['col', 'asc']
  if (_.isArray(orderBy) && !_.isArray(orderBy[0])) {
    const [col, dir] = orderBy as OrderByTuple<keyof T & string>
    return sql`ORDER BY ${entityKeyToColumn(col)} ${dirAsSql(dir)}`
  }

  // [['col1', 'asc'], 'col2', 'desc']
  const cols = (orderBy as Array<OrderByTuple<keyof T & string>>).map(
    (o) => sql`${entityKeyToColumn(o[0])} ${dirAsSql(o[1])}`
  )
  return sql`ORDER BY ${join(cols, ', ')}`
}

function dirAsSql(dir: 'asc' | 'desc') {
  return dir === 'desc' ? sql`DESC` : sql`ASC`
}

// TODO: Have an input transformer that would do this at a higher level in the DB "framework", then each method would not need to care about this separately.
function entityKeyToColumn(key: string) {
  return identifier([_.snakeCase(key)])
}

function camelCaseObject(obj: Record<string, any>) {
  return _.mapKeys(obj, (value, key) => _.camelCase(key))
}

function identifier(names: string[]) {
  const str = names.map(validateIdentifier).map(doubleQuote).join('.')
  return raw(str)
}

function doubleQuote(value: string) {
  return `"${value}"`
}

const VALID_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/

// XXX: Is this enough to keep it safe? Naively one would think that if you cannot use any other
// characters than identifier token characters, no possible input that's valid according to the regex can derail the
// parser to interpret the input as something else (i.e. SQL injection).
function validateIdentifier(name: string): string {
  if (!VALID_NAME_REGEX.test(name)) {
    throw new Error(`Invalid identifier: '${name}'`)
  }
  return name
}

// This function is responsible for converting common value types into format suitable for slonik
function valueToSqlSuitable(val: any) {
  if (_.isDate(val)) {
    return val.toISOString()
  }

  if (_.isPlainObject(val)) {
    return sql`CAST(${val} AS JSONB)`
  }

  return val
}

export function formatSqlWithValues(sqlQuery: Sql) {
  const values = sqlQuery.values ?? []
  return values.reduce((memo: string, curr, i) => {
    const sqlVariable = `$${i + 1}`
    return memo.replace(sqlVariable, toSqlValue(curr))
  }, sqlQuery.text)
}

function toSqlValue(value: unknown): string {
  if (_.isArray(value)) {
    return `ARRAY[${value.map(toSqlValue).join(', ')}]`
  } else if (_.isBoolean(value) || _.isNumber(value)) {
    return `${value}`
  }

  const escaped = escapeQuotes(`${value}`)
  return `'${escaped}'`
}

function escapeQuotes(value: string) {
  return value.replaceAll(`'`, `''`)
}
