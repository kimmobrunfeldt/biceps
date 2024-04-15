import { makeUtils } from 'src/db/interface/entityMethods'
import {
  RecipeBeforeDatabaseSchema,
  RecipeRowSchema,
} from 'src/db/schemas/RecipeSchema'

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
  tableName: 'recipes',
  beforeDatabaseSchema: RecipeBeforeDatabaseSchema,
  schema: RecipeRowSchema,
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
