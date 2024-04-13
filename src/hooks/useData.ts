import { useQuery } from '@tanstack/react-query'
import { CtxAsync, useDB } from '@vlcn.io/react'
import { DATABASE_NAME } from 'src/constants'
import { Recipe } from 'src/db/entities'
import { resolver } from 'src/db/resolvers/resolver'

const SQL_QUERY_CACHE_KEY = 'sqlQuery'

function getCacheKey(ctx: CtxAsync, key: string): string[] {
  return [SQL_QUERY_CACHE_KEY, ctx.db.siteid, key]
}

export function useGetAllRecipes() {
  const ctx = useDB(DATABASE_NAME)

  return useQuery({
    queryKey: getCacheKey(ctx, 'getAllRecipes'),
    queryFn: async () => {
      const recipeRows = await Recipe.findMany({ ctx })
      const recipes = await Promise.all(
        recipeRows.map((row) => resolver({ row, ctx }))
      )
      return recipes
    },
  })
}
