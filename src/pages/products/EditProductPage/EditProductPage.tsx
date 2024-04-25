import { Box, Flex, Text } from '@mantine/core'
import { IconAlertCircle, IconChevronLeft } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { EditProductSkeleton } from 'src/components/EditProductSkeleton'
import { Link } from 'src/components/Link'
import { NutritionCircle } from 'src/components/NutritionCircle'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import { Nutrition } from 'src/db/schemas/common'
import { useGetProduct, useUpsertProduct } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import {
  ProductForm,
  ProductFormFields,
} from 'src/pages/products/AddProductPage/components/ProductForm'
import { routes } from 'src/routes'

type Props = {
  id: string
}
export function EditProductPage({ id }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { withNotifications } = useNotifications()
  const { upsertProduct } = useUpsertProduct()
  const result = useGetProduct(id)
  const [nutrition, setNutrition] = useState<Nutrition>({
    kcal: 0,
    fatTotal: 0,
    fatSaturated: 0,
    carbsTotal: 0,
    carbsSugar: 0,
    protein: 0,
    salt: 0,
  })

  const onSubmit = useCallback(
    async (data: ProductFormFields) => {
      if (isSubmitting) return

      setIsSubmitting(true)
      try {
        await withNotifications({
          fn: async () => {
            await upsertProduct(data)
          },
          success: { message: `Product '${data.name}' saved`, color: 'green' },
          error: (err) => ({
            message: `Saving failed: ${err.message}`,
            color: 'red',
            icon: <IconAlertCircle />,
          }),
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [withNotifications, isSubmitting, upsertProduct]
  )

  const onChange = useCallback(
    (nutrition: Nutrition) => {
      setNutrition(nutrition)
    },
    [setNutrition]
  )

  return (
    <PageTemplate
      title="Edit product"
      titleRightSection={
        <Link to={routes.products.index.path}>
          <Flex direction="row" align="center">
            <IconChevronLeft /> Back to Products
          </Flex>
        </Link>
      }
    >
      <Query
        result={result}
        isEmpty={() => false}
        whenLoading={<EditProductSkeleton />}
      >
        {(product) => {
          if (!product) {
            return <Box>Product not found</Box>
          }

          return (
            <Flex direction="row" gap="xl">
              <ProductForm
                onSubmit={onSubmit}
                onChange={onChange}
                initialData={product}
              />
              <Flex direction="column" align="center">
                <Text mb={-5} c="gray">
                  Macros
                </Text>
                <NutritionCircle nutrition={nutrition} variant="large" />
              </Flex>
            </Flex>
          )
        }}
      </Query>
    </PageTemplate>
  )
}
