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
  clientUpsert,
  removeAll,
} = makeUtils({
  tableName: 'app_state',
  beforeDatabaseSchema: AppStateBeforeDatabaseSchema,
  schema: AppStateRowSchema,
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
