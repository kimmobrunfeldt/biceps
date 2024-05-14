import { makeUtils } from 'src/db/interface/entityMethods'
import {
  RecurringEventBeforeDatabaseSchema,
  RecurringEventRowSchema,
} from 'src/db/schemas/RecurringEventSchema'

const {
  find,
  count,
  findMany,
  maybeFind,
  insert,
  update,
  remove,
  upsert,
  clientUpsert,
  removeAll,
  insertMany,
} = makeUtils({
  tableName: 'recurring_events',
  name: 'RecurringEvent',
  beforeDatabaseSchema: RecurringEventBeforeDatabaseSchema,
  schema: RecurringEventRowSchema,
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
