import { makeUtils } from 'src/db/interface/entityMethods'
import {
  PersonBeforeDatabaseSchema,
  PersonRowSchema,
} from 'src/db/schemas/PersonSchema'

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
} = makeUtils({
  tableName: 'persons',
  name: 'Person',
  beforeDatabaseSchema: PersonBeforeDatabaseSchema,
  schema: PersonRowSchema,
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
