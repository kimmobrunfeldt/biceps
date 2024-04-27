import { ProductResolvedSchema } from 'src/db/schemas/ProductSchema'
import { RecipeResolvedSchema } from 'src/db/schemas/RecipeSchema'
import {
  AddIdSchema,
  DateSchema,
  IdSchema,
  addTypeName,
  preprocessors,
} from 'src/db/schemas/common'
import { z } from 'zod'

const BaseSchema = z
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
    createdAt: DateSchema,
  })
  .strict()

export const RecurringEventRowSchema = z.discriminatedUnion('eventType', [
  BaseSchema.merge(
    z.object({
      eventType: addTypeName('EatRecipe'),
      recipeToEatId: IdSchema,
      portionsToEat: z.number().min(0).max(100),
      productToEatId: z.preprocess(
        preprocessors.nullToUndefined,
        z.undefined()
      ),
      weightGramsToEat: z.preprocess(
        preprocessors.nullToUndefined,
        z.undefined()
      ),
    })
  ).strict(),
  BaseSchema.merge(
    z.object({
      eventType: addTypeName('EatProduct'),
      recipeToEatId: z.preprocess(preprocessors.nullToUndefined, z.undefined()),
      portionsToEat: z.preprocess(preprocessors.nullToUndefined, z.undefined()),
      productToEatId: IdSchema,
      weightGramsToEat: z.number().min(0).max(10000),
    })
  ).strict(),
])

export type RecurringEventRow = z.infer<typeof RecurringEventRowSchema>

const BaseBeforeDatabaseSchema = BaseSchema.omit({
  id: true,
  createdAt: true,
}).merge(
  z.object({
    id: AddIdSchema,
    createdAt: BaseSchema.shape.createdAt.optional(),
  })
)

export const RecurringEventBeforeDatabaseSchema = z.discriminatedUnion(
  'eventType',
  [
    BaseBeforeDatabaseSchema.merge(
      z.object({
        eventType: addTypeName('EatRecipe'),
        recipeToEatId: IdSchema,
        portionsToEat: z.number().min(0).max(100),
      })
    ).strict(),
    BaseBeforeDatabaseSchema.merge(
      z.object({
        eventType: addTypeName('EatProduct'),
        productToEatId: IdSchema,
        weightGramsToEat: z.number().min(0).max(10000),
      })
    ).strict(),
  ]
)

export type RecurringEventBeforeDatabase = z.infer<
  typeof RecurringEventBeforeDatabaseSchema
>

const BaseResolvedSchema = BaseSchema.omit({
  hour: true,
  minute: true,
})

export const RecurringEventResolvedSchema = z.discriminatedUnion('eventType', [
  BaseResolvedSchema.merge(
    z.object({
      eventType: addTypeName('EatRecipe'),
      time: z.object({
        hour: BaseSchema.shape.hour,
        minute: BaseSchema.shape.minute,
      }),
      recipeToEat: RecipeResolvedSchema,
      recipeToEatId: IdSchema,
      portionsToEat: z.number().min(0).max(100),
    })
  ).strict(),
  BaseResolvedSchema.merge(
    z.object({
      eventType: addTypeName('EatProduct'),
      time: z.object({
        hour: BaseSchema.shape.hour,
        minute: BaseSchema.shape.minute,
      }),
      productToEat: ProductResolvedSchema,
      productToEatId: IdSchema,
      weightGramsToEat: z.number().min(0).max(10000),
    })
  ).strict(),
])

export type RecurringEventResolved = z.infer<
  typeof RecurringEventResolvedSchema
>

const BaseResolvedBeforeSavingSchema = BaseBeforeDatabaseSchema.omit({
  hour: true,
  minute: true,
})
export const RecurringEventResolvedBeforeSavingSchema = z.discriminatedUnion(
  'eventType',
  [
    BaseResolvedBeforeSavingSchema.merge(
      z.object({
        eventType: addTypeName('EatRecipe'),
        time: z.object({
          hour: BaseSchema.shape.hour,
          minute: BaseSchema.shape.minute,
        }),
        recipeToEatId: IdSchema,
        portionsToEat: z.number().min(0).max(100),
      })
    ).strict(),
    BaseResolvedBeforeSavingSchema.merge(
      z.object({
        eventType: addTypeName('EatProduct'),
        time: z.object({
          hour: BaseSchema.shape.hour,
          minute: BaseSchema.shape.minute,
        }),
        productToEatId: IdSchema,
        weightGramsToEat: z.number().min(0).max(10000),
      })
    ).strict(),
  ]
)
export type RecurringEventResolvedBeforeSaving = z.infer<
  typeof RecurringEventResolvedBeforeSavingSchema
>
