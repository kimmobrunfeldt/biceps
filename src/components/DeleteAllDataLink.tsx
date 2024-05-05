import { Button } from '@mantine/core'
import { routes } from 'src/routes'

export const DELETE_ALL_DATA_QUERY_PARAM = 'deleteAllData'

export function DeleteAllDataLink() {
  return (
    <a href={`${routes.index.path}?${DELETE_ALL_DATA_QUERY_PARAM}=true`}>
      <Button mt="lg" color="red">
        Delete all data
      </Button>
    </a>
  )
}
