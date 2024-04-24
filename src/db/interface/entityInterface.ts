import { TXAsync } from '@vlcn.io/xplat-api'
import _ from 'lodash'
import { Sql } from 'sql-template-tag'
import { getLogger, withEntityLogging } from 'src/utils/logger'

export type Options = {
  connection: TXAsync
}

type AnyFields = Record<string, any>
type BaseEntity = AnyFields & {
  id: string
}

// This is the minimum API contract that all entities must fulfill
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
      objects: Array<BeforeDatabaseT & Partial<Omit<T, keyof BeforeDatabaseT>>>
      onConflict: Sql | any[]
    } & Options
  ) => Promise<readonly T[]>
  clientUpsert?: (
    params: {
      object: BeforeDatabaseT & Partial<Omit<T, keyof BeforeDatabaseT>>
      onConflict: Sql | any[]
    } & Options
  ) => Promise<T>
  clientUpsertMany?: (
    params: {
      objects: Array<BeforeDatabaseT & Partial<Omit<T, keyof BeforeDatabaseT>>>
      onConflict: Sql | any[]
    } & Options
  ) => Promise<readonly T[]>
  remove?: (params: { where: Partial<T> } & Options) => Promise<void>
  removeAll?: (params: Options) => Promise<void>
  removeMany?: (
    params: { where: { id: string | readonly string[] } } & Options
  ) => Promise<void>
}

type AnyFunction = (...args: any[]) => any

type MethodsWithOptionalParams = 'findAll' | 'findMany'

type EntityForCaller<T extends DatabaseEntity<any, any>> = {
  [K in keyof T]: T[K] extends AnyFunction
    ? K extends MethodsWithOptionalParams
      ? (params?: Parameters<T[K]>[0]) => ReturnType<T[K]>
      : (params: Parameters<T[K]>[0]) => ReturnType<T[K]>
    : T[K]
}

export function createEntity<T extends DatabaseEntity<any, any>>(
  name: string,
  entity: T
): EntityForCaller<T> {
  const logger = getLogger(`db:${name}`)

  return _.mapValues(entity, (val, key) => {
    if (!_.isFunction(val)) {
      return val
    }

    // This is a place to do centralized actions before any method is called
    return async (params: Record<string, any> = {}) => {
      return await withEntityLogging({
        logger,
        methodName: key,
        cb: () => val(params),
      })
    }
  }) as EntityForCaller<T>
}
