import {
  ItemResolvedBeforeSavingSchema,
  ItemResolvedSchema,
} from 'src/db/schemas/ItemSchema'
import { addTypeName } from 'src/db/schemas/common'
import { z } from 'zod'

export const RecipeItemRowSchema = z
  .object({
    __type: addTypeName('RecipeItem'),
    recipeId: z.string(),
    itemId: z.string(),
    weightGrams: z.number(),
  })
  .strict()
export type RecipeItemRow = z.infer<typeof RecipeItemRowSchema>

export const RecipeItemBeforeDatabaseSchema = RecipeItemRowSchema.omit({
  __type: true,
}).strict()
export type RecipeItemBeforeDatabase = z.infer<
  typeof RecipeItemBeforeDatabaseSchema
>

export const RecipeItemResolvedSchema = RecipeItemRowSchema.merge(
  z.object({
    item: ItemResolvedSchema,
  })
).strict()
export type RecipeItemResolved = z.infer<typeof RecipeItemResolvedSchema>

export const RecipeItemResolvedBeforeSavingSchema = z
  .object({
    weightGrams: RecipeItemRowSchema.shape.weightGrams,
    item: ItemResolvedBeforeSavingSchema,
  })
  .strict()
export type RecipeItemResolvedBeforeSaving = z.infer<
  typeof RecipeItemResolvedBeforeSavingSchema
>
