import {
  RecipeItemBeforeDatabaseSchema,
  RecipeItemRowSchema,
} from 'src/db/schemas/RecipeItemSchema'
import { makeUtils } from 'src/db/utils/entityMethods'

const { find, findMany, insert, upsert } = makeUtils({
  tableName: 'recipe_items',
  beforeDatabaseSchema: RecipeItemBeforeDatabaseSchema,
  schema: RecipeItemRowSchema,
})

export { find, findMany, insert, upsert }
