import { CtxAsync } from '@vlcn.io/react'
import _ from 'lodash'
import { Sql } from 'sql-template-tag'
import { SqlError } from 'src/db/utils/errors'
import { ZodSchema, z } from 'zod'

export function createDatabaseMethods<SchemaT extends ZodSchema>({
  ctx,
  schema,
  transformRow = _.identity,
}: {
  ctx: CtxAsync
  schema: SchemaT
  transformRow?: (row: any) => z.infer<SchemaT>
}) {
  return {
    async one(sqlQuery: Sql): Promise<z.infer<SchemaT>> {
      const rows = await ctx.db.execO(sqlQuery.sql, sqlQuery.values)
      if (rows.length > 1) {
        throw new SqlError('Unexpected amount of rows returned')
      }
      if (rows.length === 0) {
        throw new SqlError('No rows returned')
      }
      return schema.parse(transformRow(rows[0]))
    },

    async maybeOne(sqlQuery: Sql): Promise<z.infer<SchemaT> | null> {
      const rows = await ctx.db.execO(sqlQuery.sql, sqlQuery.values)
      if (rows.length > 1) {
        throw new SqlError('Unexpected amount of rows returned')
      }
      return rows[0] ? schema.parse(transformRow(rows[0])) : null
    },

    async many(sqlQuery: Sql): Promise<Array<z.infer<SchemaT>>> {
      const rows = await ctx.db.execO(sqlQuery.sql, sqlQuery.values)
      return rows.map((row) => schema.parse(transformRow(row)))
    },
  }
}
