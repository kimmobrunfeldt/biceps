import _ from 'lodash'

export type NoUndefined<T> = T extends undefined ? never : T

export function isNotUndefined<T>(val: T): val is NoUndefined<T> {
  return !_.isUndefined(val)
}

export type AnyFunction = (...args: any[]) => any
