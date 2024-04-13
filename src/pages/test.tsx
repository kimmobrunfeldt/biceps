import { useQuery } from '@tanstack/react-query'
import { useDB } from '@vlcn.io/react'
import sql from 'sql-template-tag'

export function Component() {
  const ctx = useDB('dbName')

  const threshold = 10
  const sqlQuery = sql`SELECT * FROM my_table WHERE some_value > ${threshold}`
  const {
    data: rows,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['sqlQuery', sqlQuery.sql, sqlQuery.values],
    queryFn: async () => {
      // Not sure how to represent ctx as a dependency for the query
      const rows = await ctx.db.execO<{ id: string; name: string }>(
        sqlQuery.sql,
        sqlQuery.values
      )
      return rows
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error</div>

  if (!rows) throw new Error('No data') // should not happen
  return (
    <ul>
      {rows.map((row) => (
        <li key={row.id}>{row.name}</li>
      ))}
    </ul>
  )
}
