import {
  RecipeBeforeDatabaseSchema,
  RecipeRowSchema,
} from 'src/db/schemas/RecipeSchema'
import { makeUtils } from 'src/db/utils/entityMethods'

const { find, findMany, insert, update, remove, upsert } = makeUtils({
  tableName: 'recipes',
  beforeDatabaseSchema: RecipeBeforeDatabaseSchema,
  schema: RecipeRowSchema,
})

export { find, findMany, insert, remove, update, upsert }
