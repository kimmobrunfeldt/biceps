import { addTypeName } from 'src/db/schemas/common'
import { z } from 'zod'

export const PersonRecipeRowSchema = z
  .object({
    __type: addTypeName('PersonRecipe'),
    personId: z.string(),
    recipeId: z.string(),
  })
  .strict()
export type PersonRecipeRow = z.infer<typeof PersonRecipeRowSchema>

export const PersonRecipeBeforeDatabaseSchema = PersonRecipeRowSchema.omit({
  __type: true,
}).strict()
export type PersonRecipeBeforeDatabase = z.infer<
  typeof PersonRecipeBeforeDatabaseSchema
>

export const PersonRecipeResolvedSchema = PersonRecipeRowSchema
export type PersonRecipeResolved = z.infer<typeof PersonRecipeResolvedSchema>

export const PersonRecipeResolvedBeforeSavingSchema =
  PersonRecipeBeforeDatabaseSchema
export type PersonRecipeResolvedBeforeSaving = z.infer<
  typeof PersonRecipeResolvedBeforeSavingSchema
>
