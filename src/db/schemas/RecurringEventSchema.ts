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
    weekday: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
      z.literal(7),
    ]),
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
    recipeToEatId: IdSchema,
    portionsToEat: z.number().min(0).max(100),
    createdAt: DateSchema,
  })
  .strict()
export type RecurringEventRow = z.infer<typeof RecurringEventRowSchema>

export const RecurringEventBeforeDatabaseSchema = RecurringEventRowSchema.omit({
  id: true,
  createdAt: true,
})
  .merge(
    z.object({
      id: AddIdSchema,
      createdAt: RecurringEventRowSchema.shape.createdAt.optional(),
    })
  )
  .strict()
export type RecurringEventBeforeDatabase = z.infer<
  typeof RecurringEventBeforeDatabaseSchema
>

export const RecurringEventResolvedSchema = RecurringEventRowSchema.omit({
  hour: true,
  minute: true,
})
  .merge(
    z.object({
      time: z.object({
        hour: RecurringEventRowSchema.shape.hour,
        minute: RecurringEventRowSchema.shape.minute,
      }),
      recipeToEat: RecipeResolvedSchema,
    })
  )
  .strict()
export type RecurringEventResolved = z.infer<
  typeof RecurringEventResolvedSchema
>

export const RecurringEventResolvedBeforeSavingSchema =
  RecurringEventBeforeDatabaseSchema.omit({
    hour: true,
    minute: true,
  })
    .merge(
      z.object({
        time: z.object({
          hour: RecurringEventRowSchema.shape.hour,
          minute: RecurringEventRowSchema.shape.minute,
        }),
      })
    )
    .strict()
export type RecurringEventResolvedBeforeSaving = z.infer<
  typeof RecurringEventResolvedBeforeSavingSchema
>
