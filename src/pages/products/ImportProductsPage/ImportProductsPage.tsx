import { Box, Button, Flex, Text, Textarea } from '@mantine/core'
import { IconAlertCircle, IconChevronLeft } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { GrayText } from 'src/components/GrayText'
import { Link } from 'src/components/Link'
import { PageTemplate } from 'src/components/PageTemplate'
import {
  ProductBeforeDatabase,
  ProductBeforeDatabaseSchema,
} from 'src/db/schemas/ProductSchema'
import { useInsertProducts } from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import { routes } from 'src/routes'
import { useLocation } from 'wouter'

export function ImportProductsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { withNotifications } = useNotifications()
  const [_location, setLocation] = useLocation()
  const { insertProducts } = useInsertProducts()
  const [text, setText] = useState<string>('')

  const products = text
    .trim()
    .split('\n')
    .map((line) => {
      const parts = line.split('\t')
      return {
        __type: 'Product',
        name: parts[0],
        kcal: parseFloat(parts[1]),
        fatTotal: parseFloat(parts[2]),
        fatSaturated: parseFloat(parts[3]),
        carbsTotal: parseFloat(parts[4]),
        carbsSugar: parseFloat(parts[5]),
        protein: parseFloat(parts[6]),
        salt: parseFloat(parts[7]),
      } satisfies ProductBeforeDatabase
    })
    .map((product) => {
      try {
        return ProductBeforeDatabaseSchema.parse(product)
      } catch (err) {
        return null
      }
    })
    .filter((product): product is ProductBeforeDatabase => product !== null)

  const onImportClick = useCallback(async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await withNotifications({
        fn: async () => {
          await insertProducts(products)
          setLocation(routes.products.index.path)
        },
        success: {
          message: `Imported ${products.length} products`,
          color: 'green',
        },
        error: (err) => ({
          message: `Importing failed: ${err.message}`,
          color: 'red',
          autoClose: 5000,
          icon: <IconAlertCircle />,
        }),
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [withNotifications, isSubmitting, setLocation, insertProducts, products])

  return (
    <PageTemplate
      title="Import products"
      titleRightSection={
        <Link to={routes.products.index.path}>
          <Flex direction="row" align="center">
            <IconChevronLeft /> Back to Products
          </Flex>
        </Link>
      }
    >
      <Box miw={200}>
        <Textarea
          resize="vertical"
          styles={{
            input: { minHeight: 200 },
          }}
          label={
            <Box mb="sm">
              <Box>
                Tab-separated product data <i>(grams per 100g)</i>:
              </Box>
              <GrayText fz="sm">
                name, kcal, fat, saturated fat, carbs, sugar, protein, salt
              </GrayText>
            </Box>
          }
          value={text}
          onChange={(event) => setText(event.currentTarget.value)}
          placeholder={[
            'My product	182	18.00	15.00	3.70	2.30	1.20	0.03',
            'My product 2	69	1.00	0.60	2.10	2.10	13.00	0.70',
            '...',
          ].join('\n')}
        />

        <Text mt="lg">Found {products.length} valid products to import</Text>
        <Button
          mt="lg"
          onClick={onImportClick}
          disabled={products.length === 0}
        >
          Import products
        </Button>
      </Box>
    </PageTemplate>
  )
}
