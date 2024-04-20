import { Blockquote, Box, Button, Flex, Text, Title } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconAlertCircle, IconInfoCircle, IconPlus } from '@tabler/icons-react'
import pluralize from 'pluralize'
import { useCallback } from 'react'
import { PageTemplate } from 'src/components/PageTemplate'
import { Query } from 'src/components/Query'
import { ItemResolved } from 'src/db/schemas/ItemSchema'
import {
  useDeleteProduct,
  useGetAllCustomProducts,
  useGetAllExternalProducts,
  useLazyGetRecipesByProductId,
} from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import { ProductsTable } from 'src/pages/ProductsPage/components/ProductsTable'
import { routes } from 'src/routes'
import { Link } from 'wouter'

export function ProductsPage() {
  const { withNotifications } = useNotifications()
  const customProductsResult = useGetAllCustomProducts()
  const externalProductsResult = useGetAllExternalProducts()
  const { deleteProduct } = useDeleteProduct()
  const { getRecipesByProductId } = useLazyGetRecipesByProductId()

  const onProductRemove = useCallback(
    async (product: ItemResolved) => {
      async function executeDelete() {
        await withNotifications({
          fn: async () => {
            await deleteProduct(product.id)
          },
          success: {
            message: `Product '${product.name}' deleted`,
            color: 'green',
          },
          error: {
            message: 'Failed to delete product!',
            color: 'red',
            icon: <IconAlertCircle />,
          },
        })
      }

      const recipes = await getRecipesByProductId(product.id)
      const text =
        recipes.length > 0 ? (
          <>
            Deletion{' '}
            <b>will affect {pluralize('recipe', recipes.length, true)}</b> where
            the product is used.
          </>
        ) : (
          <>The product is not used in any recipe at the moment.</>
        )

      modals.openConfirmModal({
        title: `Delete '${product.name}'?`,
        children: <Text size="sm">{text}</Text>,
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        closeOnConfirm: true,
        onConfirm: executeDelete,
      })
    },
    [getRecipesByProductId, withNotifications, deleteProduct]
  )

  return (
    <PageTemplate
      title="Products"
      titleRightSection={
        <Link to={routes.products.add.path}>
          <Button leftSection={<IconPlus size={14} />}>Add product</Button>
        </Link>
      }
    >
      <Box>
        <Blockquote my="lg" maw={900}>
          <Text>
            Product search is powered by{' '}
            <a
              href="https://world.openfoodfacts.org/"
              target="_blank"
              rel="noreferrer"
            >
              Open Food Facts
            </a>{' '}
            project. In addition, you can add custom products in this page.
          </Text>
        </Blockquote>

        <Title order={2} size="md" mt="xl">
          Custom products
        </Title>
        <Text py="md" c="gray" opacity={0.7}>
          Products added automatically by Biceps app or manually by you.
        </Text>
        <Query result={customProductsResult} whenEmpty={() => <NoProducts />}>
          {(products) => {
            return (
              <ProductsTable
                products={products}
                showRemove
                onRemove={onProductRemove}
              />
            )
          }}
        </Query>

        <Title order={2} size="md" mt={100}>
          Open Food Facts
        </Title>
        <Text py="md" c="gray" opacity={0.7}>
          Products added from Open Food Facts
        </Text>
        <Query result={externalProductsResult} whenEmpty={() => <NoProducts />}>
          {(products) => {
            return <ProductsTable products={products} />
          }}
        </Query>
      </Box>
    </PageTemplate>
  )
}

const NoProducts = () => {
  return (
    <Box>
      <ProductsTable products={[]} />
      <Flex
        py="md"
        px="sm"
        direction="row"
        align="center"
        gap={4}
        opacity={0.7}
      >
        <IconInfoCircle width={20} color="gray" />
        <Text c="gray">No products found</Text>
      </Flex>
    </Box>
  )
}
