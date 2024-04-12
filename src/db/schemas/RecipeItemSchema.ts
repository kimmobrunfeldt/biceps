import { addTypeName } from 'src/db/schemas/common'
import { z } from 'zod'

export const RecipeItemRowSchema = z
  .object({
    __type: addTypeName('RecipeItem'),
    recipeId: z.string(),
    itemId: z.string(),
  })
  .strict()
export type RecipeItemRow = z.infer<typeof RecipeItemRowSchema>

export const RecipeItemBeforeDatabaseSchema = RecipeItemRowSchema.omit({
  __type: true,
}).strict()
export type RecipeItemBeforeDatabase = z.infer<
  typeof RecipeItemBeforeDatabaseSchema
>

export const RecipeItemSchema = RecipeItemRowSchema
export type RecipeItem = z.infer<typeof RecipeItemSchema>
