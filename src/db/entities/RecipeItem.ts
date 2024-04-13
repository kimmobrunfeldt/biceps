import { makeUtils } from 'src/db/interface/entityMethods'
import {
  RecipeItemBeforeDatabaseSchema,
  RecipeItemRowSchema,
} from 'src/db/schemas/RecipeItemSchema'

const { find, findMany, insert, upsert, clientUpsert } = makeUtils({
  tableName: 'recipe_items',
  beforeDatabaseSchema: RecipeItemBeforeDatabaseSchema,
  schema: RecipeItemRowSchema,
})

export { clientUpsert, find, findMany, insert, upsert }
