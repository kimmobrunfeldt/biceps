import { Loader, Text } from '@mantine/core'
import { UseQueryResult } from '@tanstack/react-query'
import _ from 'lodash'
import { ReactNode } from 'react'
import { useSpinDelay } from 'spin-delay'

type Props<T> = {
  result: UseQueryResult<T>
  children: (data: T) => ReactNode
  loaderDelayMs?: number
  isEmpty?: (data: T) => boolean
  whenEmpty?: (data: T) => ReactNode
  isLoading?: (result: UseQueryResult<T>) => boolean
  whenLoading?: JSX.Element
  pickData?: (result: UseQueryResult<T>) => UseQueryResult<T>['data']
}

export function Query<T>({
  result,
  children,
  loaderDelayMs = 0,
  isEmpty = defaultIsEmpty,
  isLoading = (result) => result.isLoading || result.isFetching,
  pickData = (result) => result.data,
  whenEmpty = () => <Text>No results found</Text>,
  whenLoading = <Loader size="sm" />,
}: Props<T>): JSX.Element {
  const showSpinner = useSpinDelay(isLoading(result), {
    delay: loaderDelayMs,
    minDuration: 300,
  })

  if (result.error) {
    return <Text>Something went wrong when fetching data</Text>
  }

  if (showSpinner) {
    return whenLoading
  }

  const data = pickData(result)
  if (!data) {
    return <Text>Something went wrong</Text>
  }

  if (isEmpty(data)) {
    return <>{whenEmpty(data)}</>
  }

  return <>{children(data)}</>
}

function defaultIsEmpty(data: any) {
  if (_.isArray(data)) {
    return data.length === 0
  }

  return Boolean(data)
}
