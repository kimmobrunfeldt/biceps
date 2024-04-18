import { useQuery } from '@tanstack/react-query'
import { api } from 'src/utils/foodApi'

const queryNames = {
  search: 'search',
}

/**
 * Cache key prefix to use for all food API related queries.
 */
const FOOD_API_QUERY_CACHE_KEY = 'foodApi'

type Options = {
  searchTerms: string
}

export function useSearch(options: Options) {
  return useQuery({
    enabled: options.searchTerms.length > 0,
    queryKey: [
      FOOD_API_QUERY_CACHE_KEY,
      queryNames.search,
      options.searchTerms,
    ],
    throwOnError: true,
    queryFn: async () => {
      /*
      await sleep(500)
      console.log('return!')
      return {
        products: [{ id: '1', product_name: 'test' } as Product],
      }*/

      return await api('GET /cgi/search.pl', {
        query: { search_terms: options.searchTerms },
      })
    },
  })
}
