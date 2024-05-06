import { UseQueryResult } from '@tanstack/react-query'
import { useState } from 'react'

export type PaginationOpts = {
  limit: number
  offset: number
}

type PaginatedQueryHook<T> = (opts: PaginationOpts) => UseQueryResult<{
  totalCount: number
  results: T[]
}>

const PAGE_SIZES = [10, 20, 50, 100, 200, 500]

const DEFAULT_PAGE_SIZE = 20

export function usePaginatedQuery<T>(useData: PaginatedQueryHook<T>) {
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [pageIndex, setPageIndex] = useState<number>(0)
  const queryResult = useData({
    limit: pageSize,
    offset: pageIndex * pageSize,
  })

  const totalCount = queryResult.data?.totalCount ?? 0
  return {
    pageSize,
    setPageSize: (size: number) => {
      setPageSize(size)
      setPageIndex(0)
    },
    pageIndex,
    setPageIndex,
    queryResult,
    totalPages: Math.ceil(totalCount / pageSize),
    shouldShowPagination: totalCount > DEFAULT_PAGE_SIZE,
    pageSizes: PAGE_SIZES,
  }
}
