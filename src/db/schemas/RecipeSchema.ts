import {
  RecipeItemResolvedBeforeSavingSchema,
  RecipeItemResolvedSchema,
} from 'src/db/schemas/RecipeItemSchema'
import {
  AddIdSchema,
  DateSchema,
  IdSchema,
  NameSchema,
  addTypeName,
} from 'src/db/schemas/common'
import { z } from 'zod'

export const RecipeRowSchema = z
  .object({
    __type: addTypeName('Recipe'),
    id: IdSchema,
    name: NameSchema,
    createdAt: DateSchema,
  })
  .strict()
export type RecipeRow = z.infer<typeof RecipeRowSchema>

export const RecipeBeforeDatabaseSchema = z
  .object({
    id: AddIdSchema,
    name: RecipeRowSchema.shape.name,
    createdAt: RecipeRowSchema.shape.createdAt.optional(),
  })
  .strict()
export type RecipeBeforeDatabase = z.infer<typeof RecipeBeforeDatabaseSchema>

export const RecipeResolvedSchema = RecipeRowSchema.merge(
  z.object({
    __type: RecipeRowSchema.shape.__type,
    id: RecipeRowSchema.shape.id,
    name: NameSchema,
    createdAt: DateSchema,
    recipeItems: z.array(RecipeItemResolvedSchema),
  })
).strict()
export type RecipeResolved = z.infer<typeof RecipeResolvedSchema>

export const RecipeResolvedBeforeSavingSchema =
  RecipeBeforeDatabaseSchema.merge(
    z.object({
      recipeItems: z.array(RecipeItemResolvedBeforeSavingSchema),
    })
  ).strict()
export type RecipeResolvedBeforeSaving = z.infer<
  typeof RecipeResolvedBeforeSavingSchema
>
