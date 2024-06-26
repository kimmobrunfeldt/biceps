import { resolvers } from 'src/db/resolvers/resolversPerEntity'
import {
  CommonResolverOptions,
  EntityRow,
  TypeToEntityRowMapping,
} from 'src/db/resolvers/types'
import { getLogger } from 'src/utils/logger'

export type ResolverMapping = {
  [K in keyof TypeToEntityRowMapping]: K extends keyof typeof resolvers
    ? Awaited<ReturnType<(typeof resolvers)[K]>>
    : TypeToEntityRowMapping[K]
}

export type ResolvedEntity = ResolverMapping[keyof ResolverMapping]

// Resolves entity foreign key references
export async function resolver<T extends EntityRow>({
  row,
  connection,
  loaders,
}: {
  row: T
} & CommonResolverOptions): Promise<ResolverMapping[T['__type']]> {
  // We have a fallback later in case the resolver has not been implemented
  const maybeResolver = (resolvers as any)[row.__type]
  const resolverForEntity = maybeResolver ?? identityResolver
  const result = await resolverForEntity({ row, connection, loaders })

  const logger = getLogger(`resolver:${row.__type ?? '<unknown entity>'}`)
  logger.debug('Resolved', row, '\n\n->\n\n', result)
  return result
}

export async function identityResolver<T>({ row }: { row: T }): Promise<T> {
  return row
}
