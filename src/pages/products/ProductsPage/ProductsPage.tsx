import { Blockquote, Box, Button, Flex, Text, Title } from '@mantine/core'
import { modals } from '@mantine/modals'
import {
  IconAlertCircle,
  IconExternalLink,
  IconInfoCircle,
  IconPlus,
} from '@tabler/icons-react'
import pluralize from 'pluralize'
import { useCallback } from 'react'
import { PageTemplate } from 'src/components/PageTemplate'
import { PaperContainer } from 'src/components/PaperContainer'
import { Query } from 'src/components/Query'
import { TableSkeleton } from 'src/components/TableSkeleton'
import { ProductResolved } from 'src/db/schemas/ProductSchema'
import {
  useDeleteProduct,
  useGetAllCustomProducts,
  useGetAllExternalProducts,
  useLazyGetRecipesByProductId,
} from 'src/hooks/useDatabase'
import { useNotifications } from 'src/hooks/useNotification'
import { ProductsTable } from 'src/pages/products/ProductsPage/components/ProductsTable'
import { routes } from 'src/routes'
import { Link } from 'wouter'

export function ProductsPage() {
  const { withNotifications } = useNotifications()
  const customProductsResult = useGetAllCustomProducts()
  const externalProductsResult = useGetAllExternalProducts()
  const { deleteProduct } = useDeleteProduct()
  const { getRecipesByProductId } = useLazyGetRecipesByProductId()

  const onProductRemove = useCallback(
    async (product: ProductResolved) => {
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
        <Blockquote maw={900} p="lg" radius="md">
          <Text>
            Product search is powered by{' '}
            <a
              href="https://world.openfoodfacts.org/"
              target="_blank"
              rel="noreferrer"
            >
              Open Food Facts{' '}
              <IconExternalLink
                size={16}
                style={{ position: 'relative', top: '2px' }}
              />
            </a>{' '}
            project. In addition, you can add custom products in this page.
          </Text>
        </Blockquote>

        <Title order={2} size="md" mt="xl">
          Custom products
        </Title>
        <Text py="sm" c="gray" opacity={0.7}>
          Products added automatically by Biceps app or manually by you.
        </Text>
        <PaperContainer>
          <Query
            result={customProductsResult}
            whenEmpty={() => <NoProducts />}
            whenLoading={<TableSkeleton />}
          >
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
        </PaperContainer>

        <Title order={2} size="md" mt={80}>
          Open Food Facts
        </Title>
        <Text py="sm" c="gray" opacity={0.7}>
          Products added from Open Food Facts
        </Text>
        <PaperContainer>
          <Query
            result={externalProductsResult}
            whenEmpty={() => <NoProducts />}
            whenLoading={<TableSkeleton />}
          >
            {(products) => {
              return <ProductsTable products={products} />
            }}
          </Query>
        </PaperContainer>
      </Box>
    </PageTemplate>
  )
}

const NoProducts = () => {
  return (
    <Box>
      <ProductsTable products={[]} />
      <Flex px="sm" direction="row" align="center" gap={4} opacity={0.7}>
        <IconInfoCircle width={20} color="gray" />
        <Text c="gray">No products</Text>
      </Flex>
    </Box>
  )
}
