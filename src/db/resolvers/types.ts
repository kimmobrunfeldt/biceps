import { TXAsync } from '@vlcn.io/xplat-api'
import { DataLoaders } from 'src/db/dataLoaders'
import { allEntities } from 'src/db/entities'

export type TypeToEntityRowMapping = {
  [K in keyof typeof allEntities]: Awaited<
    ReturnType<(typeof allEntities)[K]['find']>
  >
}

export type EntityRow = TypeToEntityRowMapping[keyof TypeToEntityRowMapping]
export type EntityRowByType<T extends EntityRow['__type']> = Extract<
  EntityRow,
  { __type: T }
>

export type CommonResolverOptions = {
  connection: TXAsync
  loaders: DataLoaders
}
