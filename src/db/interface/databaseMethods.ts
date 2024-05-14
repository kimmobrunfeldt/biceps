import { TXAsync } from '@vlcn.io/xplat-api'
import _ from 'lodash'
import { Sql } from 'sql-template-tag'
import { parse } from 'src/db/schemas/common'
import { SqlError } from 'src/db/utils/errors'
import { ZodSchema, z } from 'zod'

export function createDatabaseMethods<SchemaT extends ZodSchema>({
  connection,
  schema,
  transformRow = _.identity,
}: {
  connection: TXAsync
  schema: SchemaT
  transformRow?: (row: any) => z.infer<SchemaT>
}) {
  return {
    async one(sqlQuery: Sql): Promise<z.infer<SchemaT>> {
      const rows = await connection.execO(sqlQuery.sql, sqlQuery.values)
      if (rows.length > 1) {
        throw new SqlError('Unexpected amount of rows returned')
      }
      if (rows.length === 0) {
        throw new SqlError('No rows returned')
      }
      return parse(transformRow(rows[0]), schema)
    },

    async maybeOne(sqlQuery: Sql): Promise<z.infer<SchemaT> | null> {
      const rows = await connection.execO(sqlQuery.sql, sqlQuery.values)
      if (rows.length > 1) {
        throw new SqlError('Unexpected amount of rows returned')
      }
      return rows[0] ? parse(transformRow(rows[0]), schema) : null
    },

    async many(sqlQuery: Sql): Promise<Array<z.infer<SchemaT>>> {
      const rows = await connection.execO(sqlQuery.sql, sqlQuery.values)
      return rows.map((row) => parse(transformRow(row), schema))
    },
  }
}

/**
 * Like connection.transaction but provides return value.
 */
export async function withTransaction<T>(
  connection: TXAsync,
  cb: (tx: TXAsync) => Promise<T>
): Promise<T> {
  let result: T
  await connection.tx(async (tx) => {
    result = await cb(tx)
  })
  return result!
}
