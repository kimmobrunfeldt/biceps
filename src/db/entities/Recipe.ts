import { makeUtils } from 'src/db/interface/entityMethods'
import {
  RecipeBeforeDatabaseSchema,
  RecipeRowSchema,
} from 'src/db/schemas/RecipeSchema'

const { find, findMany, insert, update, remove, upsert, clientUpsert } =
  makeUtils({
    tableName: 'recipes',
    beforeDatabaseSchema: RecipeBeforeDatabaseSchema,
    schema: RecipeRowSchema,
  })

export { clientUpsert, find, findMany, insert, remove, update, upsert }
