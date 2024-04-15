import _ from 'lodash'
import sql, { Sql, join, raw } from 'sql-template-tag'
import { createDatabaseMethods } from 'src/db/interface/databaseMethods'
import { Options } from 'src/db/interface/entityInterface'
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

type ComparisonToken = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'IN'
type Comparison<T> = { comparison: ComparisonToken; value: T | readonly T[] }

type WhereObject<FullObjT extends Record<string, any>> = {
  [K in keyof FullObjT]: FullObjT[K] | Comparison<FullObjT[K]>
}

export type FindOptions<T extends Record<string, any>> = {
  where?: WhereConditions<T>
  limit?: number
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
}: {
  tableName: string
  beforeDatabaseSchema: BeforeDatabaseSchemaT
  schema: SchemaT
}) {
  const createDatabaseMethodsWithTransform: typeof createDatabaseMethods = (
    opts
  ) => {
    return createDatabaseMethods({ ...opts, transformRow: camelCaseObject })
  }

  const table = identifier([inputTableName])

  function baseInsertAsSql(object: z.infer<BeforeDatabaseSchemaT>) {
    const validObject = beforeDatabaseSchema.parse(object)
    const keys = Object.keys(validObject)
    const filteredKeys = keys.filter((key) => !_.isUndefined(validObject[key]))

    return sql`
      INSERT INTO ${table} (
        ${join(
          filteredKeys.map((key) => entityKeyToColumn(key)),
          ', '
        )}
      ) VALUES (
        ${join(
          filteredKeys.map((key) => valueToSqlSuitable(validObject[key])),
          ', '
        )}
      )
    `
  }

  function insertAsSql(object: z.infer<BeforeDatabaseSchemaT>) {
    return sql`
      ${baseInsertAsSql(object)}
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
      ${baseInsertAsSql(object)}
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
    // Default limit to 2 to prevent accidental large queries but still allow to throw
    // when the where criteria returns more than one row.
    limit = 2,
  }: Options & FindOptions<z.infer<SchemaT>>): Promise<z.infer<SchemaT>> {
    const { limitSql, orderBySql, whereSql } = findOptionsAsSql({
      where,
      orderBy,
      limit,
    })
    const sqlQuery = sql`
      SELECT * FROM ${table}
      ${whereSql}
      ${orderBySql}
      ${limitSql}
    `
    const { one } = createDatabaseMethodsWithTransform({ connection, schema })
    return await one(sqlQuery)
  }

  async function maybeFind({
    connection,
    where,
    orderBy,
    limit = 2,
  }: Options & FindOptions<z.infer<SchemaT>>): Promise<z.infer<SchemaT>> {
    const { limitSql, orderBySql, whereSql } = findOptionsAsSql({
      where,
      orderBy,
      limit,
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
    return await maybeOne(sqlQuery)
  }

  async function findMany({
    connection,
    where,
    limit,
    orderBy,
  }: Options & FindOptions<z.infer<SchemaT>>): Promise<
    readonly z.infer<SchemaT>[]
  > {
    const { limitSql, orderBySql, whereSql } = findOptionsAsSql({
      where,
      orderBy,
      limit,
    })
    const sqlQuery = sql`
      SELECT * FROM ${table}
      ${whereSql}
      ${orderBySql}
      ${limitSql}
    `
    const { many } = createDatabaseMethodsWithTransform({ connection, schema })
    return await many(sqlQuery)
  }

  async function insert({
    object,
    connection,
  }: Options & { object: z.infer<BeforeDatabaseSchemaT> }): Promise<
    z.infer<SchemaT>
  > {
    const sqlQuery = insertAsSql(object)
    const { one } = createDatabaseMethodsWithTransform({ connection, schema })
    return await one(sqlQuery)
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
    return await one(sqlQuery)
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
    if (!_.isArray(onConflict)) {
      throw new Error('clientUpsert requires onConflict to be an array')
    }

    const onConflictWhere = _.pick(object, onConflict) as WhereConditions<
      z.infer<SchemaT>
    >
    const found = await maybeFind({ connection, where: onConflictWhere })
    if (found) {
      return await update({ connection, where: onConflictWhere, set: object })
    }

    return await insert({ connection, object })
  }

  async function update({
    set,
    connection,
    where,
  }: Options & {
    set: Partial<z.infer<BeforeDatabaseSchemaT>>
    where: WhereConditions<z.infer<SchemaT>>
  }): Promise<z.infer<SchemaT>> {
    const keys: string[] = Object.keys(set)
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
    return await one(sqlQuery)
  }

  async function remove({
    connection,
    where,
  }: Options & {
    where: WhereConditions<z.infer<SchemaT>>
  }): Promise<void> {
    const query = sql`
      DELETE FROM ${table} WHERE ${whereAsSql(where)}
    `
    await connection.exec(query.sql, query.values)
  }

  async function removeAll({ connection }: Options): Promise<void> {
    const query = sql`DELETE FROM ${table}`
    await connection.exec(query.sql, query.values)
  }

  return {
    find,
    maybeFind,
    findMany,
    insert,
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
  limit,
}: FindOptions<T>) {
  return {
    whereSql:
      Object.keys(where).length > 0 ? sql`WHERE ${whereAsSql(where)}` : sql``,
    limitSql: limit ? sql`LIMIT ${limit}` : sql``,
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
