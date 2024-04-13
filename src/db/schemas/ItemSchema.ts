import {
  DateFieldSchema,
  NameSchema,
  addTypeName,
  preprocessors,
} from 'src/db/schemas/common'
import { z } from 'zod'

export const ItemRowSchema = z
  .object({
    __type: addTypeName('Item'),
    id: z.string(),
    name: NameSchema,
    kcal: z.number().int().nonnegative(),
    fatTotal: z.number().nonnegative(),
    fatSaturated: z.number().nonnegative(),
    carbsTotal: z.number().nonnegative(),
    carbsSugar: z.number().nonnegative(),
    protein: z.number().nonnegative(),
    salt: z.number().nonnegative(),
    imageUrl: z.preprocess(
      preprocessors.nullToUndefined,
      z.string().url().optional()
    ),
    createdAt: DateFieldSchema,
  })
  .strict()
export type ItemRow = z.infer<typeof ItemRowSchema>

export const ItemBeforeDatabaseSchema = ItemRowSchema.omit({
  __type: true,
  createdAt: true,
})
  .merge(
    z.object({
      createdAt: ItemRowSchema.shape.createdAt.optional(),
    })
  )
  .strict()
export type ItemBeforeDatabase = z.infer<typeof ItemBeforeDatabaseSchema>

export const ItemSchema = ItemRowSchema
export type Item = z.infer<typeof ItemSchema>
