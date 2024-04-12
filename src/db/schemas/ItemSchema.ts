import { DateFieldSchema, NameSchema, addTypeName } from 'src/db/schemas/common'
import { z } from 'zod'

export const ItemRowSchema = z
  .object({
    __type: addTypeName('Item'),
    id: z.string(),
    name: NameSchema,
    kcal: z.number().int().positive(),
    fatTotal: z.number().positive(),
    fatSaturated: z.number().positive(),
    carbsTotal: z.number().positive(),
    carbsSugar: z.number().positive(),
    protein: z.number().positive(),
    salt: z.number().positive(),
    imageUrl: z.string().url().optional(),
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
