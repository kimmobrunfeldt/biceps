import { makeUtils } from 'src/db/interface/entityMethods'
import {
  AppStateBeforeDatabaseSchema,
  AppStateRowSchema,
} from 'src/db/schemas/AppState'

const {
  find,
  findMany,
  insert,
  update,
  remove,
  upsert,
  maybeFind,
  clientUpsert,
  removeAll,
} = makeUtils({
  tableName: 'app_state',
  name: 'AppState',
  beforeDatabaseSchema: AppStateBeforeDatabaseSchema,
  schema: AppStateRowSchema,
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
