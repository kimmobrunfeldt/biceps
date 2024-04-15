import _ from 'lodash'
import { nanoId } from 'src/utils/nanoid'
import { z } from 'zod'

export const preprocessors = {
  addNanoId: (val: unknown) => (!_.isNil(val) ? val : nanoId()),
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
  .max(64, { message: 'Minimum length is 64 characters' })
