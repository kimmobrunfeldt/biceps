import {
  AddIdSchema,
  DateSchema,
  IdSchema,
  NameSchema,
  addTypeName,
} from 'src/db/schemas/common'
import { z } from 'zod'

export const PersonRowSchema = z
  .object({
    __type: addTypeName('Person'),
    id: IdSchema,
    name: NameSchema,
    createdAt: DateSchema,
  })
  .strict()
export type PersonRow = z.infer<typeof PersonRowSchema>

export const PersonBeforeDatabaseSchema = z
  .object({
    id: AddIdSchema,
    name: PersonRowSchema.shape.name,
    createdAt: PersonRowSchema.shape.createdAt.optional(),
  })
  .strict()
export type PersonBeforeDatabase = z.infer<typeof PersonBeforeDatabaseSchema>

export const PersonResolvedSchema = PersonRowSchema.merge(
  z.object({
    initials: z.string(),
  })
).strict()
export type PersonResolved = z.infer<typeof PersonResolvedSchema>

export const PersonResolvedBeforeSavingSchema = PersonBeforeDatabaseSchema
export type PersonResolvedBeforeSaving = z.infer<
  typeof PersonResolvedBeforeSavingSchema
>
