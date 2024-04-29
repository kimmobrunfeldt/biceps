import {
  PersonResolvedBeforeSavingSchema,
  PersonResolvedSchema,
} from 'src/db/schemas/PersonSchema'
import { DateSchema, IdSchema, addTypeName } from 'src/db/schemas/common'
import { z } from 'zod'

export const AppStateRowSchema = z
  .object({
    __type: addTypeName('AppState'),
    key: z.string(),
    selectedPersonId: IdSchema,
    onboardingCompletedAt: z.union([DateSchema, z.null()]),
    createdAt: DateSchema,
  })
  .strict()
export type AppStateRow = z.infer<typeof AppStateRowSchema>

export const AppStateBeforeDatabaseSchema = z
  .object({
    key: z.string(),
    selectedPersonId: IdSchema,
    onboardingCompletedAt:
      AppStateRowSchema.shape.onboardingCompletedAt.optional(),
    createdAt: AppStateRowSchema.shape.createdAt.optional(),
  })
  .strict()
export type AppStateBeforeDatabase = z.infer<
  typeof AppStateBeforeDatabaseSchema
>

export const AppStateResolvedSchema = AppStateRowSchema.merge(
  z.object({
    onboardingState: z.union([
      z.literal('NewUser'),
      z.literal('ProfileCreated'),
      z.literal('RecipeAdded'),
      z.literal('WeeklyScheduleAdded'),
      z.literal('Completed'),
    ]),
    selectedPerson: PersonResolvedSchema,
  })
).strict()
export type AppStateResolved = z.infer<typeof AppStateResolvedSchema>

export const AppStateResolvedBeforeSavingSchema =
  AppStateBeforeDatabaseSchema.merge(
    z.object({
      onboardingState: z.union([
        z.literal('NewUser'),
        z.literal('ProfileCreated'),
        z.literal('RecipeAdded'),
        z.literal('WeeklyScheduleAdded'),
        z.literal('Completed'),
      ]),
      selectedPerson: z.array(PersonResolvedBeforeSavingSchema),
    })
  ).strict()
export type AppStateResolvedBeforeSaving = z.infer<
  typeof AppStateResolvedBeforeSavingSchema
>
