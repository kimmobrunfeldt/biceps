import _ from 'lodash'
import {
  Nutrition,
  isTotalCarbsGreaterOrEqualToSugars,
  isTotalFatGreaterOrEqualToSaturatedFat,
  isTotalLessOrEqualTo100Grams,
} from 'src/db/schemas/common'
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

const ProductRefinedSchema = ProductSchema.superRefine((values, ctx) => {
  const nutrition: Nutrition = {
    kcal: values.nutriments['energy-kcal_100g'],
    fatTotal: values.nutriments.fat_100g,
    fatSaturated: values.nutriments['saturated-fat_100g'],
    carbsTotal: values.nutriments.carbohydrates_100g,
    carbsSugar: values.nutriments.sugars_100g,
    protein: values.nutriments.proteins_100g,
    salt: values.nutriments.salt_100g,
  }

  if (!isTotalLessOrEqualTo100Grams(nutrition)) {
    const fields = [
      'fatTotal',
      'fatSaturated',
      'carbsTotal',
      'carbsSugar',
      'protein',
      'salt',
    ] as const
    fields.forEach((field) => {
      const value = Number.isFinite(nutrition[field]) ? nutrition[field] : 0
      if (value > 0) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: 'Nutrition values per 100g add up to more than 100 grams',
        })
      }
    })
  } else if (!isTotalFatGreaterOrEqualToSaturatedFat(nutrition)) {
    ctx.addIssue({
      code: 'custom',
      path: ['fatTotal'],
      message: `Total fat must be greater than or equal to saturated fat (${nutrition.fatSaturated})`,
    })
  } else if (!isTotalCarbsGreaterOrEqualToSugars(nutrition)) {
    ctx.addIssue({
      code: 'custom',
      path: ['carbsTotal'],
      message: `Total carbs must be greater than or equal to sugar (${nutrition.carbsSugar})`,
    })
  }

  return values
})
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

      const validProducts: Product[] = json.products
        .map((product: any) => {
          try {
            return ProductRefinedSchema.parse(product)
          } catch (e) {
            console.log(
              'Discarding invalid product from search results',
              _.pick(product, Object.keys(ProductSchema.shape))
            )
            console.log('Discarded due to error', e)
            return undefined
          }
        })
        .filter(isNotUndefined)

      console.log(
        'Found',
        validProducts.length,
        'valid products',
        validProducts.map((p) => _.pick(p, Object.keys(ProductSchema.shape)))
      )
      console.log('Full valid products', validProducts)
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
