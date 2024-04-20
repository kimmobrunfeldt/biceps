import {
  AddBicepsIdSchema,
  DateSchema,
  IdSchema,
  NameSchema,
  addTypeName,
  preprocessors,
} from 'src/db/schemas/common'
import { z } from 'zod'

export const ProductRowSchema = z
  .object({
    __type: addTypeName('Product'),
    id: IdSchema,
    name: NameSchema,
    kcal: z.number().int().nonnegative(),
    fatTotal: z.number().nonnegative(),
    fatSaturated: z.number().nonnegative(),
    carbsTotal: z.number().nonnegative(),
    carbsSugar: z.number().nonnegative(),
    protein: z.number().nonnegative(),
    salt: z.number().nonnegative(),
    imageThumbUrl: z.preprocess(
      preprocessors.nullToUndefined,
      z.string().url().optional()
    ),
    imageUrl: z.preprocess(
      preprocessors.nullToUndefined,
      z.string().url().optional()
    ),
    createdAt: DateSchema,
  })
  .strict()
export type ProductRow = z.infer<typeof ProductRowSchema>

export const ProductBeforeDatabaseSchema = ProductRowSchema.omit({
  id: true,
  createdAt: true,
})
  .merge(
    z.object({
      id: AddBicepsIdSchema,
      createdAt: ProductRowSchema.shape.createdAt.optional(),
    })
  )
  .strict()
export type ProductBeforeDatabase = z.infer<typeof ProductBeforeDatabaseSchema>

export const ProductResolvedSchema = ProductRowSchema
export type ProductResolved = z.infer<typeof ProductResolvedSchema>

export const ProductResolvedBeforeSavingSchema = ProductBeforeDatabaseSchema
export type ProductResolvedBeforeSaving = z.infer<
  typeof ProductResolvedBeforeSavingSchema
>
