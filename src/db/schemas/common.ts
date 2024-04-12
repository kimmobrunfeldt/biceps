import _ from 'lodash'
import { z } from 'zod'

export const preprocessors = {
  nullToUndefined: (val: unknown) => (!_.isNull(val) ? val : undefined),
  dateToIsoString: (val: unknown) => (!_.isDate(val) ? val : val.toISOString()),
  isoStringToDate: (val: unknown) => (!_.isString(val) ? val : new Date(val)),
}

export function addTypeName<T extends string>(name: T) {
  return z.preprocess(() => name, z.literal(name))
}

export const DateFieldSchema = z.preprocess(
  preprocessors.isoStringToDate,
  z.date()
)
export const DateIsoStringFieldSchema = z.preprocess(
  preprocessors.dateToIsoString,
  z.string().datetime()
)
export const NameSchema = z
  .string()
  .min(2, { message: 'Minimum length is 2 characters' })
  .max(64, { message: 'Minimum length is 64 characters' })
