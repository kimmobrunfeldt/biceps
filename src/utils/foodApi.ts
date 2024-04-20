import _ from 'lodash'
import { ApiHttpError, fetchWrapper } from 'src/utils/fetch'
import { isNotUndefined } from 'src/utils/typeUtils'
import { z } from 'zod'

const ProductSchema = z
  .object({
    id: z.string(),
    product_name: z.string().min(3),
    quantity: z.string().optional(),
    product_quantity: z.number(),
    product_quantity_unit: z.string().optional(),
    image_thumb_url: z.string().url().optional(),
    image_url: z.string().url().optional(),
    nutriments: z
      .object({
        'energy-kcal_100g': z.number(),
        fat_100g: z.number(),
        'saturated-fat_100g': z.number(),
        carbohydrates_100g: z.number(),
        sugars_100g: z.number(),
        proteins_100g: z.number(),
        salt_100g: z.number(),
      })
      .passthrough(),
  })
  .passthrough()
export type Product = z.infer<typeof ProductSchema>

const SearchResponseSchema = z
  .object({
    products: z.array(ProductSchema),
  })
  .passthrough()

const apiResponseMapping = {
  // https://wiki.openfoodfacts.org/API/Read/Search
  'GET /cgi/search.pl': {
    defaultQueryOptions: {
      search_simple: 1,
      action: 'process',
      json: 1,
    },
    parser: (json: any): z.infer<typeof SearchResponseSchema> => {
      if (!_.isArray(json?.products)) {
        throw new Error('Invalid response')
      }

      const validProducts = json.products
        .map((product: any) => {
          try {
            return ProductSchema.parse(product)
          } catch (e) {
            console.error(
              'Invalid product:',
              _.pick(product, Object.keys(ProductSchema.shape))
            )
            console.error(e)
            return undefined
          }
        })
        .filter(isNotUndefined)

      console.log('validProducts', validProducts)
      return SearchResponseSchema.parse({
        ...json,
        products: validProducts,
      })
    },
  },
} as const
type ApiResponseMapping = typeof apiResponseMapping

type Options<ReqT extends keyof ApiResponseMapping> = Omit<
  RequestInit,
  'body'
> & {
  body?: ApiResponseMapping[ReqT] extends { body: infer Body }
    ? Body
    : undefined
  params?: Record<string, unknown>
  query?: Record<string, unknown>
}

const BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'https://world.openfoodfacts.org'
    : 'https://world.openfoodfacts.net'

export async function api<ReqT extends keyof ApiResponseMapping>(
  req: ReqT,
  opts: Options<ReqT> = {}
): Promise<ReturnType<ApiResponseMapping[ReqT]['parser']>> {
  const definition = apiResponseMapping[req]

  const [method, path] = req.split(' ')
  const pathWithParams = addPathParams(path, opts.params ?? {})
  const fullUrl = new URL(pathWithParams, BASE_URL)

  const query: Record<string, any> = {
    ...definition.defaultQueryOptions,
    ...opts.query,
  }
  Object.keys(query).forEach((key) => {
    const val = query[key]
    if (_.isArray(val)) {
      val.forEach((v) => fullUrl.searchParams.append(key, String(v)))
    } else {
      fullUrl.searchParams.set(key, String(query[key]))
    }
  })

  const { body, ...restOpts } = opts

  const res = await fetchWrapper(fullUrl.toString(), {
    ...restOpts,
    method,
    headers: {
      //'X-User-Agent': 'Biceps Nutrition Web App v0.1 - https://biceps.app',
      ...(opts.headers ? opts.headers : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    throw new ApiHttpError(res.status, res.statusText)
  }
  const json = await res.json()
  return definition.parser(json) as ReturnType<
    ApiResponseMapping[ReqT]['parser']
  >
}

function addPathParams(path: string, params: Record<string, unknown>): string {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(`:${key}`, String(value))
  }, path)
}
