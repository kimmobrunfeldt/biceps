import { makeUtils } from 'src/db/interface/entityMethods'
import {
  PersonBeforeDatabaseSchema,
  PersonRowSchema,
} from 'src/db/schemas/PersonSchema'

const {
  find,
  findMany,
  insert,
  update,
  remove,
  upsert,
  clientUpsert,
  removeAll,
} = makeUtils({
  tableName: 'persons',
  beforeDatabaseSchema: PersonBeforeDatabaseSchema,
  schema: PersonRowSchema,
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
