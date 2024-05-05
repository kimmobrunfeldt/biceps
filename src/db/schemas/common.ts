import _ from 'lodash'
import { DATABASE_ID_PREFIX } from 'src/constants'
import { nanoId } from 'src/utils/nanoid'
import { calculateMacros } from 'src/utils/nutrition'
import { z } from 'zod'

export const preprocessors = {
  addNanoId: (val: unknown) => (!_.isNil(val) ? val : nanoId()),
  addBicepsNanoId: (val: unknown) =>
    !_.isNil(val) ? val : `${DATABASE_ID_PREFIX}-${nanoId()}`,
  nullToUndefined: (val: unknown) => (!_.isNull(val) ? val : undefined),
  dateToIsoString: (val: unknown) => (!_.isDate(val) ? val : val.toISOString()),
  isoStringToDate: (val: unknown) => (!_.isString(val) ? val : new Date(val)),
  jsonStringToObject: (val: unknown) =>
    !_.isString(val) ? val : JSON.parse(val),
  objectToJsonString: (val: unknown) =>
    !_.isPlainObject(val) ? val : JSON.stringify(val),
}

export const IdSchema = z
  .string()
  .min(5, { message: 'Minimum length is 5 characters' })

/**
 * Automatically creates an ID if not provided.
 * The preprocessor guarantees that output cannot be nullish, but the type still
 * allows the value to be optional because these types are used as the input
 * types for entity methods.
 */
export const AddIdSchema = z.preprocess(
  preprocessors.addNanoId,
  z.string().optional()
)
export const AddBicepsIdSchema = z.preprocess(
  preprocessors.addBicepsNanoId,
  z.string().optional()
)

export const GramsPer100GramsSchema = z
  .number()
  .max(100, {
    message:
      'Maximum value is 100. For example 200g of sugar per 100g is impossible.',
  })
  .nonnegative()

export function addTypeName<T extends string>(name: T) {
  return z.preprocess(() => name, z.literal(name))
}

export const DateSchema = z.preprocess(preprocessors.isoStringToDate, z.date())
export const DateIsoStringSchema = z.preprocess(
  preprocessors.dateToIsoString,
  z.string().datetime()
)
export const NameSchema = z
  .string()
  .min(2, { message: 'Minimum length is 2 characters' })
  .max(200, { message: 'Maximum length is 200 characters' })

export const NutritionPer100GramsSchema = z
  .object({
    kcal: z.number().int().nonnegative(),
    fatTotal: GramsPer100GramsSchema,
    fatSaturated: GramsPer100GramsSchema,
    carbsTotal: GramsPer100GramsSchema,
    carbsSugar: GramsPer100GramsSchema,
    protein: GramsPer100GramsSchema,
    salt: GramsPer100GramsSchema,
  })
  .strict()
export type Nutrition = z.infer<typeof NutritionPer100GramsSchema>

export function isTotalLessOrEqualTo100Grams(
  nutrition: Pick<Nutrition, 'kcal' | 'carbsTotal' | 'fatTotal' | 'protein'>
) {
  const macros = calculateMacros(nutrition)
  const total = _.sum(Object.values(macros.macroDistribution))
  return total <= 100
}

export function isTotalFatGreaterOrEqualToSaturatedFat(
  nutrition: Pick<Nutrition, 'fatTotal' | 'fatSaturated'>
) {
  return nutrition.fatTotal >= nutrition.fatSaturated
}

export function isTotalCarbsGreaterOrEqualToSugars(
  nutrition: Pick<Nutrition, 'carbsTotal' | 'carbsSugar'>
) {
  return nutrition.carbsTotal >= nutrition.carbsSugar
}
