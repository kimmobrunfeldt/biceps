import { Box, Button, Text, Title } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconExternalLink, IconPlus, IconX } from '@tabler/icons-react'
import pluralize from 'pluralize'
import { useCallback } from 'react'
import { GrayText } from 'src/components/GrayText'
import { Link } from 'src/components/Link'
import { PageTemplate } from 'src/components/PageTemplate'
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

export function ProductsPage() {
  const { withNotifications } = useNotifications()
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
            icon: <IconX />,
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
      description={
        <>
          {' '}
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
        </>
      }
    >
      <Box>
        <Title order={2} size="h3" mt="md">
          Custom products
        </Title>
        <GrayText py="sm">
          Products added automatically by Biceps app or manually by you
        </GrayText>
        <ProductsTable
          useData={useGetAllCustomProducts}
          showRemove
          onRemove={onProductRemove}
        />

        <Title order={2} size="h3" mt={80}>
          Open Food Facts
        </Title>
        <GrayText py="sm">Products added from Open Food Facts</GrayText>
        <ProductsTable
          useData={useGetAllExternalProducts}
          showRemove
          onRemove={onProductRemove}
        />
      </Box>
    </PageTemplate>
  )
}
