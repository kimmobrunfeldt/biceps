import { allEntities } from 'src/db/entities'

export type EntityByType<T extends Entity['__type']> = Extract<
  Entity,
  { __type: T }
>

export type TypeToFullEntityMapping = {
  [K in keyof typeof allEntities]: Awaited<
    ReturnType<(typeof allEntities)[K]['find']>
  >
}

export type Entity = TypeToFullEntityMapping[keyof TypeToFullEntityMapping]
