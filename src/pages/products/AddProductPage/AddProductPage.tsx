import { Flex, Text } from '@mantine/core'
import { IconAlertCircle, IconChevronLeft } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { Link } from 'src/components/Link'
import { NutritionCircle } from 'src/components/NutritionCircle'
import { PageTemplate } from 'src/components/PageTemplate'
import { Nutrition } from 'src/db/schemas/common'
import { useUpsertProduct } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import {
  ProductForm,
  ProductFormFields,
} from 'src/pages/products/AddProductPage/components/ProductForm'
import { routes } from 'src/routes'
import { useLocation } from 'wouter'

export function AddProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { withNotifications } = useNotifications()
  const [_location, setLocation] = useLocation()
  const { upsertProduct } = useUpsertProduct()
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
            setLocation(routes.products.index.path)
          },
          success: { message: `Product '${data.name}' added`, color: 'green' },
          error: (err) => ({
            message: `Adding failed: ${err.message}`,
            color: 'red',
            autoClose: 5000,
            icon: <IconAlertCircle />,
          }),
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [withNotifications, isSubmitting, setLocation, upsertProduct]
  )

  const onChange = useCallback(
    (nutrition: Nutrition) => {
      setNutrition(nutrition)
    },
    [setNutrition]
  )

  return (
    <PageTemplate
      title="Add product"
      titleRightSection={
        <Link to={routes.products.index.path}>
          <Flex direction="row" align="center">
            <IconChevronLeft /> Back to Products
          </Flex>
        </Link>
      }
    >
      <Flex direction="row" gap="xl">
        <ProductForm onSubmit={onSubmit} onChange={onChange} />
        <Flex direction="column" align="center">
          <Text mb={-5} c="gray">
            Macros
          </Text>
          <NutritionCircle nutrition={nutrition} variant="large" />
        </Flex>
      </Flex>
    </PageTemplate>
  )
}
