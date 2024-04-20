import {
  ProductResolvedBeforeSavingSchema,
  ProductResolvedSchema,
} from 'src/db/schemas/ProductSchema'
import { DateSchema, addTypeName } from 'src/db/schemas/common'
import { z } from 'zod'

export const RecipeItemRowSchema = z
  .object({
    __type: addTypeName('RecipeItem'),
    recipeId: z.string(),
    productId: z.string(),
    weightGrams: z.number(),
    createdAt: DateSchema,
  })
  .strict()
export type RecipeItemRow = z.infer<typeof RecipeItemRowSchema>

export const RecipeItemBeforeDatabaseSchema = RecipeItemRowSchema.omit({
  __type: true,
  createdAt: true,
})
  .merge(
    z.object({
      createdAt: RecipeItemRowSchema.shape.createdAt.optional(),
    })
  )
  .strict()
export type RecipeItemBeforeDatabase = z.infer<
  typeof RecipeItemBeforeDatabaseSchema
>

export const RecipeItemResolvedSchema = RecipeItemRowSchema.merge(
  z.object({
    product: ProductResolvedSchema,
  })
).strict()
export type RecipeItemResolved = z.infer<typeof RecipeItemResolvedSchema>

export const RecipeItemResolvedBeforeSavingSchema = z
  .object({
    __type: RecipeItemRowSchema.shape.__type,
    createdAt: RecipeItemRowSchema.shape.createdAt.optional(),
    recipeId: RecipeItemRowSchema.shape.recipeId.optional(),
    productId: RecipeItemRowSchema.shape.productId.optional(),
    weightGrams: RecipeItemRowSchema.shape.weightGrams,
    product: ProductResolvedBeforeSavingSchema,
  })
  .strict()
export type RecipeItemResolvedBeforeSaving = z.infer<
  typeof RecipeItemResolvedBeforeSavingSchema
>
