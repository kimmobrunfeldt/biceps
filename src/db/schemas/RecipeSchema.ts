import { ItemRowSchema as ItemSchema } from 'src/db/schemas/ItemSchema'
import { DateFieldSchema, NameSchema, addTypeName } from 'src/db/schemas/common'
import { z } from 'zod'

export const RecipeRowSchema = z
  .object({
    __type: addTypeName('Recipe'),
    id: z.string(),
    name: NameSchema,
    createdAt: DateFieldSchema,
  })
  .strict()
export type RecipeRow = z.infer<typeof RecipeRowSchema>

export const RecipeBeforeDatabaseSchema = z
  .object({
    id: RecipeRowSchema.shape.id,
    name: RecipeRowSchema.shape.name,
    createdAt: RecipeRowSchema.shape.createdAt.optional(),
  })
  .strict()
export type RecipeBeforeDatabase = z.infer<typeof RecipeBeforeDatabaseSchema>

export const RecipeSchema = RecipeRowSchema.merge(
  z.object({
    __type: addTypeName('Recipe'),
    id: z.string(),
    name: NameSchema,
    createdAt: DateFieldSchema,
    items: z.array(ItemSchema),
  })
).strict()
export type Recipe = z.infer<typeof RecipeSchema>
