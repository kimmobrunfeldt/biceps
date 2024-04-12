import { resolvers } from 'src/db/resolvers/resolversPerEntity'
import { Entity, TypeToFullEntityMapping } from 'src/db/resolvers/types'

export type ResolverMapping = {
  [K in keyof TypeToFullEntityMapping]: K extends keyof typeof resolvers
    ? Awaited<ReturnType<(typeof resolvers)[K]>>
    : TypeToFullEntityMapping[K]
}

export type ResolvedEntity = ResolverMapping[keyof ResolverMapping]

// Resolves entity foreign key references
export async function resolver<T extends Entity>(
  entity: T
): Promise<ResolverMapping[T['__type']]> {
  // @ts-expect-error We have a fallback
  const maybeResolver = resolvers[entity.__type]
  const resolverForEntity = maybeResolver ?? identityResolver
  return await resolverForEntity(entity)
}

export async function identityResolver<T>(entity: T): Promise<T> {
  return entity
}
