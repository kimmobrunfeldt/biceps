import { UseQueryResult } from '@tanstack/react-query'

export function transformQueryResult<T, U>(
  result: UseQueryResult<T>,
  mapper: (result: T) => U
): UseQueryResult<U> {
  return {
    ...result,
    data: result.data ? mapper(result.data) : undefined,
  } as UseQueryResult<U>
}
