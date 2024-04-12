import { CtxAsync, useDB } from '@vlcn.io/react'
import _ from 'lodash'
import { Sql } from 'sql-template-tag'

export type Options = {
  ctx: CtxAsync
}

type AnyFields = Record<string, any>
type BaseEntity = AnyFields & {
  id: string
}

// This is the minimum API contract that all entities must fulfill. Normally
// most methods are defaults via `slonikUtils.makeUtils()`, but db entities
// can also choose to implement their own if required.
export type DatabaseEntity<
  BeforeDatabaseT extends AnyFields,
  T extends BaseEntity,
> = {
  // Explicitly disallow exposing this via entity object
  // More complex SQL should be written as a new method within the db/entities/Entity.ts
  // Those methods can internally use this helper. Goal is to avoid spreading random SQL fragments
  // outside the DB layer.
  findManyBySql?: never

  exists?: (params: { where: Partial<T> } & Options) => Promise<boolean>
  find?: (params: { where: Partial<T> } & Options) => Promise<T>
  findAll?: (params: Options) => Promise<readonly T[]>
  maybeFind?: (params: { where: Partial<T> } & Options) => Promise<T | null>
  findMany?: (params: { where: Partial<T> } & Options) => Promise<readonly T[]>
  update?: (
    params: {
      where: Partial<T>
      set: Partial<BeforeDatabaseT>
    } & Options
  ) => Promise<T>
  insert?: (params: { object: BeforeDatabaseT } & Options) => Promise<T>
  insertMany?: (
    params: { objects: BeforeDatabaseT[] } & Options
  ) => Promise<readonly T[]>
  upsert?: (
    params: {
      object: BeforeDatabaseT & Partial<Omit<T, keyof BeforeDatabaseT>>
      // TODO: should be SqlToken | keyof DatabaseT[] but it didn't work
      // Inference will return anyways slonikUtils types so it's not a big deal
      onConflict: Sql | any[]
    } & Options
  ) => Promise<T>
  upsertMany?: (
    params: {
      objects: Array<Partial<Omit<T, 'id'>> & Pick<T, 'id'>>
    } & Options
  ) => Promise<readonly T[]>
  remove?: (params: { where: Partial<T> } & Options) => Promise<void>
  removeMany?: (
    params: { where: { id: string | readonly string[] } } & Options
  ) => Promise<void>
}

type AnyFunction = (...args: any[]) => any
type PartialMethodOptions<T extends Record<string, any>> = Omit<
  T,
  keyof Options
> &
  Partial<Options>

type MethodsWithOptionalParams = 'findAll'

type EntityForCaller<T extends DatabaseEntity<any, any>> = {
  [K in keyof T]: T[K] extends AnyFunction
    ? K extends MethodsWithOptionalParams
      ? (params?: PartialMethodOptions<Parameters<T[K]>[0]>) => ReturnType<T[K]>
      : (params: PartialMethodOptions<Parameters<T[K]>[0]>) => ReturnType<T[K]>
    : T[K]
}

export function createEntity<T extends DatabaseEntity<any, any>>(
  entity: T
): EntityForCaller<T> {
  return _.mapValues(entity, (val) => {
    if (!_.isFunction(val)) {
      return val
    }

    return async (params: Record<string, any> = {}) => {
      if ('ctx' in params) {
        return await val(params)
      }

      const ctx = useDB('biteplanner')
      return await val({ ...params, ctx })
    }
  }) as EntityForCaller<T>
}
