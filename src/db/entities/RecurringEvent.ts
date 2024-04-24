import { makeUtils } from 'src/db/interface/entityMethods'
import {
  RecurringEventBeforeDatabaseSchema,
  RecurringEventRowSchema,
} from 'src/db/schemas/RecurringEventSchema'

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
  tableName: 'recurring_events',
  name: 'RecurringEvent',
  beforeDatabaseSchema: RecurringEventBeforeDatabaseSchema,
  schema: RecurringEventRowSchema,
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
