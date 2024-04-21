import { RecipeItemRowSchema } from 'src/db/schemas/RecipeItemSchema'
import { RecipeResolvedSchema } from 'src/db/schemas/RecipeSchema'
import {
  AddIdSchema,
  DateSchema,
  IdSchema,
  addTypeName,
} from 'src/db/schemas/common'
import { z } from 'zod'

export const RecurringEventRowSchema = z
  .object({
    __type: addTypeName('RecurringEvent'),
    id: IdSchema,
    weekday: z.number().int().min(1).max(7),
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
    recipeToEatId: IdSchema,
    percentageToEat: z.number().int().min(0).max(100),
    createdAt: DateSchema,
  })
  .strict()
export type RecurringEventRow = z.infer<typeof RecurringEventRowSchema>

export const RecurringEventBeforeDatabaseSchema = RecipeItemRowSchema.omit({
  id: true,
  createdAt: true,
})
  .merge(
    z.object({
      id: AddIdSchema,
      createdAt: RecipeItemRowSchema.shape.createdAt.optional(),
    })
  )
  .strict()
export type RecurringEventBeforeDatabase = z.infer<
  typeof RecurringEventBeforeDatabaseSchema
>

export const RecurringEventResolvedSchema = RecurringEventRowSchema.merge(
  z.object({
    recipeToEat: RecipeResolvedSchema,
  })
).strict()
export type RecurringEventResolved = z.infer<
  typeof RecurringEventResolvedSchema
>

export const RecurringEventResolvedBeforeSavingSchema =
  RecurringEventBeforeDatabaseSchema.merge(
    z.object({
      recipeToEat: RecipeResolvedSchema,
    })
  ).strict()
export type RecurringEventResolvedBeforeSaving = z.infer<
  typeof RecurringEventResolvedBeforeSavingSchema
>
