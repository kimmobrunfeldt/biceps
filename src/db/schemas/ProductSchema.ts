import {
  AddBicepsIdSchema,
  DateSchema,
  IdSchema,
  NameSchema,
  NutritionPer100GramsSchema,
  addTypeName,
  isTotalLessOrEqualTo100Grams,
  preprocessors,
} from 'src/db/schemas/common'
import { z } from 'zod'

export const BaseProductRowSchema = z
  .object({
    __type: addTypeName('Product'),
    id: IdSchema,
    name: NameSchema,
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
  .merge(NutritionPer100GramsSchema)
  .strict()

export const ProductRowSchema = BaseProductRowSchema.refine(
  isTotalLessOrEqualTo100Grams
)

export type ProductRow = z.infer<typeof BaseProductRowSchema>

export const ProductBeforeDatabaseSchema = BaseProductRowSchema.omit({
  id: true,
  createdAt: true,
})
  .merge(
    z.object({
      id: AddBicepsIdSchema,
      createdAt: BaseProductRowSchema.shape.createdAt.optional(),
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
