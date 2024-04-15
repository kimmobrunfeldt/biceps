import { makeUtils } from 'src/db/interface/entityMethods'
import {
  PersonRecipeBeforeDatabaseSchema,
  PersonRecipeRowSchema,
} from 'src/db/schemas/PersonRecipeSchema'

const { find, findMany, insert, upsert, clientUpsert, removeAll } = makeUtils({
  tableName: 'person_recipes',
  beforeDatabaseSchema: PersonRecipeBeforeDatabaseSchema,
  schema: PersonRecipeRowSchema,
})

export { clientUpsert, find, findMany, insert, removeAll, upsert }
