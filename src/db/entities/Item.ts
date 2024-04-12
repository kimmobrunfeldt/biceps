import {
  ItemBeforeDatabaseSchema,
  ItemRowSchema,
} from 'src/db/schemas/ItemSchema'
import { makeUtils } from 'src/db/utils/entityMethods'

const { find, findMany, insert, update, remove, upsert } = makeUtils({
  tableName: 'items',
  beforeDatabaseSchema: ItemBeforeDatabaseSchema,
  schema: ItemRowSchema,
})

export { find, findMany, insert, remove, update, upsert }
