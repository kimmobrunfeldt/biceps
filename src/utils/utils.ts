import _ from 'lodash'
import { AnyFunction } from 'src/utils/typeUtils'
import { PartialDeep } from 'type-fest'

export function deepOmitBy<T extends Record<string, any>>(
  obj: T,
  fn: (val: unknown) => boolean
): PartialDeep<T> {
  return deepApply(obj, (obj) => _.omitBy(obj, fn))
}

export function deepApply<T extends Record<string, any>>(
  obj: T,
  toApply: AnyFunction
): any {
  const omitted = toApply(obj)
  return _.mapValues(omitted, (val) =>
    _.isPlainObject(val) ? deepApply(val, toApply) : val
  )
}
